import { useCallback, useEffect, useRef } from "preact/compat";

class DotRenderer {
	private static instance: DotRenderer | null = null;
	private static imageSpoilerInstance: DotRenderer | null = null;
	private static textSpoilerInstance: DotRenderer | null = null;
	private static createdSpoilers = new WeakMap<HTMLCanvasElement, any>();
	private static shaderTexts: { [url: string]: string | Promise<string> } = {};

	private canvas: HTMLCanvasElement;
	private context: WebGL2RenderingContext;
	private program!: WebGLProgram;
	private buffer!: WebGLBuffer[];
	private bufferParticlesCount!: number;
	private drawCallbacks: Map<HTMLElement, () => void> = new Map();
	private targetCanvasesCount = 0;

	private reset = true;
	private time = 0;
	private bufferIndex = 0;
	private inited = false;
	private paused = true;
	private animationFrame!: number;
	private lastDrawTime!: number;

	private timeHandle!: WebGLUniformLocation;
	private deltaTimeHandle!: WebGLUniformLocation;
	private sizeHandle!: WebGLUniformLocation;
	private resetHandle!: WebGLUniformLocation;

	private radiusHandle!: WebGLUniformLocation;
	private seedHandle!: WebGLUniformLocation;
	private noiseScaleHandle!: WebGLUniformLocation;
	private noiseSpeedHandle!: WebGLUniformLocation;
	private dampingMultHandle!: WebGLUniformLocation;
	private velocityMultHandle!: WebGLUniformLocation;
	private forceMultHandle!: WebGLUniformLocation;
	private longevityHandle!: WebGLUniformLocation;
	private maxVelocityHandle!: WebGLUniformLocation;
	private noiseMovementHandle!: WebGLUniformLocation;
	private colorHandle!: WebGLUniformLocation;

	private config: {
		particlesCount: number;
		radius: number;
		seed: number;
		noiseScale: number;
		noiseSpeed: number;
		forceMult: number;
		velocityMult: number;
		dampingMult: number;
		maxVelocity: number;
		longevity: number;
		noiseMovement: number;
		timeScale: number;
		color: number;
	};

	private dpr: number;

	constructor() {
		this.canvas = document.createElement("canvas");
		this.dpr = window.devicePixelRatio || 1;
		this.canvas.classList.add("canvas-thumbnail", "canvas-dots");
		this.context = this.canvas.getContext("webgl2", {
			preserveDrawingBuffer: true,
		})!;

		this.config = {
			particlesCount: 1000,
			radius: this.dpr * 1.6,
			seed: Math.random() * 10,
			noiseScale: 6,
			noiseSpeed: 0.6,
			forceMult: 0.6,
			velocityMult: 1.0,
			dampingMult: 0.9999,
			maxVelocity: 6.0,
			longevity: 1.4,
			noiseMovement: 4,
			timeScale: 0.65,
			color: 0xffffff,
		};

		this.resize(480, 480);
	}

	public getDefaultParticlesCount(width: number, height: number) {
		return Math.min(
			Math.max(((width * height) / (500 * 500)) * 1000 * 10, 500),
			10000,
		);
	}

	private resize(
		width: number,
		height: number,
		config: Partial<typeof this.config> = {},
	) {
		this.canvas.width = width * this.dpr;
		this.canvas.height = height * this.dpr;

		this.config = {
			...this.config,
			particlesCount: this.getDefaultParticlesCount(width, height),
			radius: this.dpr * 1.6,
			...config,
		};

		if (this.inited) {
			this.draw();
		}
	}

	private genBuffer() {
		if (this.buffer && this.buffer[0] && this.buffer[1]) {
			this.context.deleteBuffer(this.buffer[0]);
			this.context.deleteBuffer(this.buffer[1]);
		}

		this.buffer = [];
		for (let i = 0; i < 2; ++i) {
			const buf = this.context.createBuffer();
			if (!buf) throw new Error("Failed to create WebGL buffer");
			this.buffer[i] = buf;
			this.context.bindBuffer(this.context.ARRAY_BUFFER, buf);
			const bufferSize =
				(this.bufferParticlesCount = Math.ceil(this.config.particlesCount)) *
				6 *
				4;
			const bufferData = new Float32Array(bufferSize / 4);
			this.context.bufferData(
				this.context.ARRAY_BUFFER,
				bufferData,
				this.context.DYNAMIC_DRAW,
			);
		}
	}

	private compileShader(type: number, path: string): Promise<WebGLShader> {
		const shader = this.context.createShader(type);
		if (!shader) throw new Error("Failed to create shader");

		const shaderTextResult = (DotRenderer.shaderTexts[path] ??= fetch(path)
			.then((response) => response.text())
			.then(
				(text) =>
					(DotRenderer.shaderTexts[path] = text + "\n//" + Math.random()),
			));

		return Promise.resolve(shaderTextResult).then((shaderText: string) => {
			this.context.shaderSource(shader, shaderText);
			this.context.compileShader(shader);

			if (
				!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)
			) {
				throw new Error(
					"Shader compile error:\n" + this.context.getShaderInfoLog(shader),
				);
			}

			return shader;
		});
	}

	private compileShaders(): Promise<[WebGLShader, WebGLShader]> {
		return Promise.all([
			this.compileShader(
				this.context.VERTEX_SHADER,
				"/assets/spoiler_vertex.glsl",
			),
			this.compileShader(
				this.context.FRAGMENT_SHADER,
				"/assets/spoiler_fragment.glsl",
			),
		]);
	}

	private init(): Promise<void> {
		if (this.inited) return Promise.resolve();

		return this.compileShaders().then(([vertexShader, fragmentShader]) => {
			this.program = this.context.createProgram();
			if (!this.program) throw new Error("Failed to create program");

			this.context.attachShader(this.program, vertexShader);
			this.context.attachShader(this.program, fragmentShader);

			this.context.transformFeedbackVaryings(
				this.program,
				["outPosition", "outVelocity", "outTime", "outDuration"],
				this.context.INTERLEAVED_ATTRIBS,
			);

			this.context.linkProgram(this.program);
			if (
				!this.context.getProgramParameter(
					this.program,
					this.context.LINK_STATUS,
				)
			) {
				throw new Error(
					"Program link error:\n" +
						this.context.getProgramInfoLog(this.program),
				);
			}

			this.context.deleteShader(vertexShader);
			this.context.deleteShader(fragmentShader);

			this.timeHandle = this.context.getUniformLocation(this.program, "time")!;
			this.deltaTimeHandle = this.context.getUniformLocation(
				this.program,
				"deltaTime",
			)!;
			this.sizeHandle = this.context.getUniformLocation(this.program, "size")!;
			this.resetHandle = this.context.getUniformLocation(
				this.program,
				"reset",
			)!;
			this.radiusHandle = this.context.getUniformLocation(this.program, "r")!;
			this.seedHandle = this.context.getUniformLocation(this.program, "seed")!;
			this.noiseScaleHandle = this.context.getUniformLocation(
				this.program,
				"noiseScale",
			)!;
			this.noiseSpeedHandle = this.context.getUniformLocation(
				this.program,
				"noiseSpeed",
			)!;
			this.dampingMultHandle = this.context.getUniformLocation(
				this.program,
				"dampingMult",
			)!;
			this.velocityMultHandle = this.context.getUniformLocation(
				this.program,
				"velocityMult",
			)!;
			this.forceMultHandle = this.context.getUniformLocation(
				this.program,
				"forceMult",
			)!;
			this.longevityHandle = this.context.getUniformLocation(
				this.program,
				"longevity",
			)!;
			this.maxVelocityHandle = this.context.getUniformLocation(
				this.program,
				"maxVelocity",
			)!;
			this.noiseMovementHandle = this.context.getUniformLocation(
				this.program,
				"noiseMovement",
			)!;
			this.colorHandle = this.context.getUniformLocation(
				this.program,
				"color",
			)!;

			this.context.clearColor(0, 0, 0, 0);
			this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
			this.context.enable(this.context.BLEND);
			this.context.blendFunc(
				this.context.SRC_ALPHA,
				this.context.ONE_MINUS_SRC_ALPHA,
			);

			this.genBuffer();
			this.inited = true;
			this.lastDrawTime = Date.now();
		});
	}

	private draw() {
		if (!this.inited || this.paused) return;

		const now = Date.now();
		const dt =
			Math.min((now - this.lastDrawTime) / 1000, 1) * this.config.timeScale;
		this.lastDrawTime = now;
		this.time += dt;

		if (this.bufferParticlesCount < this.config.particlesCount) {
			this.genBuffer();
			this.reset = true;
		}

		this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.context.clear(this.context.COLOR_BUFFER_BIT);
		this.context.useProgram(this.program);

		if (
			!this.context.getProgramParameter(this.program, this.context.LINK_STATUS)
		) {
			return;
		}

		this.context.uniform1f(this.resetHandle, this.reset ? 1 : 0);
		if (this.reset) {
			this.time = 0;
			this.reset = false;
		}
		this.context.uniform1f(this.timeHandle, this.time);
		this.context.uniform1f(this.deltaTimeHandle, dt);
		this.context.uniform2f(
			this.sizeHandle,
			this.canvas.width,
			this.canvas.height,
		);
		this.context.uniform1f(this.seedHandle, this.config.seed);
		this.context.uniform1f(this.radiusHandle, this.config.radius);
		this.context.uniform1f(this.noiseScaleHandle, this.config.noiseScale);
		this.context.uniform1f(this.noiseSpeedHandle, this.config.noiseSpeed);
		this.context.uniform1f(this.dampingMultHandle, this.config.dampingMult);
		this.context.uniform1f(this.velocityMultHandle, this.config.velocityMult);
		this.context.uniform1f(this.forceMultHandle, this.config.forceMult);
		this.context.uniform1f(this.longevityHandle, this.config.longevity);
		this.context.uniform1f(this.maxVelocityHandle, this.config.maxVelocity);
		this.context.uniform1f(this.noiseMovementHandle, this.config.noiseMovement);
		this.context.uniform3f(
			this.colorHandle,
			((this.config.color >> 16) & 0xff) / 0xff,
			((this.config.color >> 8) & 0xff) / 0xff,
			(this.config.color & 0xff) / 0xff,
		);

		const currentBuffer = this.buffer[this.bufferIndex];
		if (!currentBuffer) return;
		this.context.bindBuffer(this.context.ARRAY_BUFFER, currentBuffer);
		this.context.vertexAttribPointer(0, 2, this.context.FLOAT, false, 24, 0);
		this.context.enableVertexAttribArray(0);
		this.context.vertexAttribPointer(1, 2, this.context.FLOAT, false, 24, 8);
		this.context.enableVertexAttribArray(1);
		this.context.vertexAttribPointer(2, 1, this.context.FLOAT, false, 24, 16);
		this.context.enableVertexAttribArray(2);
		this.context.vertexAttribPointer(3, 1, this.context.FLOAT, false, 24, 20);
		this.context.enableVertexAttribArray(3);

		const otherBuffer = this.buffer[1 - this.bufferIndex];
		if (!otherBuffer) return;
		this.context.bindBufferBase(
			this.context.TRANSFORM_FEEDBACK_BUFFER,
			0,
			otherBuffer,
		);

		this.context.beginTransformFeedback(this.context.POINTS);
		this.context.drawArrays(this.context.POINTS, 0, this.config.particlesCount);
		this.context.endTransformFeedback();

		this.context.bindBuffer(this.context.ARRAY_BUFFER, null);
		this.context.bindBufferBase(
			this.context.TRANSFORM_FEEDBACK_BUFFER,
			0,
			null,
		);
		this.bufferIndex = 1 - this.bufferIndex;
		this.drawCallbacks.forEach((callback) => callback());
	}

	public play() {
		if (!this.paused) return;

		this.paused = false;
		this.lastDrawTime = Date.now();

		const animate = () => {
			if (this.paused) return;

			this.draw();
			this.animationFrame = requestAnimationFrame(animate);
		};

		animate();
	}

	public pause() {
		if (this.paused) return;

		this.paused = true;
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
	}

	public remove() {
		this.pause();
		this.destroy();
	}

	private destroy() {
		if (this.buffer && this.buffer[0] && this.buffer[1]) {
			this.context.deleteBuffer(this.buffer[0]);
			this.context.deleteBuffer(this.buffer[1]);
		}

		if (this.program) {
			this.context.deleteProgram(this.program);
		}
	}

	public static getInstance(): DotRenderer {
		if (!DotRenderer.instance) {
			DotRenderer.instance = new DotRenderer();
		}
		return DotRenderer.instance;
	}

	public static getImageSpoilerInstance(): DotRenderer {
		if (!DotRenderer.imageSpoilerInstance) {
			DotRenderer.imageSpoilerInstance = new DotRenderer();
			DotRenderer.imageSpoilerInstance.resize(480, 480);
		}
		return DotRenderer.imageSpoilerInstance;
	}

	public static getTextSpoilerInstance(): DotRenderer {
		if (!DotRenderer.textSpoilerInstance) {
			const instanceCanvasWidth = 240;
			const instanceCanvasHeight = 120;

			DotRenderer.textSpoilerInstance = new DotRenderer();

			/**
			 * Bigger DPR will make a visible separation between drawn chunks (when text spoilers are huge)
			 * Do not make this bigger, unless there is a way to mirror the dot on the other side when it is close to some margin
			 */
			DotRenderer.textSpoilerInstance.dpr = Math.min(
				2,
				window.devicePixelRatio,
			);
			DotRenderer.textSpoilerInstance.resize(
				instanceCanvasWidth,
				instanceCanvasHeight,
				{
					particlesCount:
						4 *
						DotRenderer.textSpoilerInstance.getDefaultParticlesCount(
							instanceCanvasWidth,
							instanceCanvasHeight,
						),
					noiseSpeed: 5,
					maxVelocity: 10,
					timeScale: 1.2,
					radius: 1.8 * DotRenderer.textSpoilerInstance.dpr,
					forceMult: 0.2,
					velocityMult: 0.4,
					dampingMult: 2.2,
					longevity: 5.0,
				},
			);
		}
		return DotRenderer.textSpoilerInstance;
	}

	public static createSpoiler({
		width,
		height,
		onPlay,
		onPause,
		onDestroy,
		config,
	}: {
		width?: number;
		height?: number;
		onPlay: () => void;
		onPause: () => void;
		onDestroy?: () => void;
		config?: Partial<DotRenderer["config"]>;
	}) {
		const instance = DotRenderer.getImageSpoilerInstance();

		if (config) {
			Object.assign(instance.config, config);
		}

		const canvas = document.createElement("canvas");
		canvas.classList.add("canvas-thumbnail", "canvas-dots");
		const dpr = window.devicePixelRatio || 1;

		canvas.width = (width || 480) * dpr;
		canvas.height = (height || 480) * dpr;

		const context = canvas.getContext("2d");

		const x = Math.floor(
			Math.random() * (instance.canvas.width - canvas.width),
		);
		const y = Math.floor(
			Math.random() * (instance.canvas.height - canvas.height),
		);

		const draw = () => {
			if (!context) return;

			const { width: canvasWidth, height: canvasHeight } = canvas;
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			context.drawImage(
				instance.canvas,
				x,
				y,
				canvasWidth,
				canvasHeight,
				0,
				0,
				canvasWidth,
				canvasHeight,
			);
		};

		++instance.targetCanvasesCount;

		const animation = {
			play: () => {
				instance.drawCallbacks.set(canvas, draw);
				instance.play();
				onPlay();
			},
			pause: () => {
				instance.drawCallbacks.delete(canvas);
				if (!instance.drawCallbacks.size) {
					instance.pause();
				}
				onPause();
			},
			destroy: () => {
				if (--instance.targetCanvasesCount === 0) {
					instance.remove();
					DotRenderer.imageSpoilerInstance = null;
				}
				onDestroy?.();
			},
		};

		DotRenderer.createdSpoilers.set(canvas, animation);

		return {
			canvas,
			animation,
			readyResult: instance.init(),
		};
	}

	public static getSpoilerByElement(element: HTMLElement) {
		return DotRenderer.createdSpoilers.get(element as HTMLCanvasElement);
	}
}

interface SpoilerOverlayProps {
	visible: boolean;
	onReveal: () => void;
	originalImage?: HTMLImageElement | null;
	blurRadius?: number;
	animationDuration?: number;
}

const SpoilerOverlay = ({
	visible,
	onReveal,
	originalImage,
	blurRadius = 28,
	animationDuration = 300,
}: SpoilerOverlayProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const spoilerRef = useRef<any>(null);

	const drawSpoiler = useCallback(
		(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
			if (!originalImage) return;
			const cw = canvas.width,
				ch = canvas.height;
			const iw = originalImage.naturalWidth || originalImage.width;
			const ih = originalImage.naturalHeight || originalImage.height;
			const scale = Math.min(cw / iw, ch / ih);
			const dw = iw * scale,
				dh = ih * scale;
			const dx = (cw - dw) / 2,
				dy = (ch - dh) / 2;
			ctx.save();
			ctx.filter = `blur(${blurRadius}px)`;
			ctx.drawImage(originalImage, 0, 0, iw, ih, dx, dy, dw, dh);
			ctx.restore();
			if (spoilerRef.current) {
				ctx.drawImage(
					spoilerRef.current.canvas,
					0,
					0,
					spoilerRef.current.canvas.width,
					spoilerRef.current.canvas.height,
					0,
					0,
					canvas.width,
					canvas.height,
				);
			}
		},
		[originalImage, blurRadius],
	);

	const handleClick = useCallback(
		(event: MouseEvent) => {
			if (!canvasRef.current || !spoilerRef.current || !originalImage) return;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			const rect = canvas.getBoundingClientRect();
			const clickX = (event.clientX - rect.left) * (canvas.width / rect.width);
			const clickY = (event.clientY - rect.top) * (canvas.height / rect.height);
			const distToMargin = Math.max(
				Math.hypot(clickX, clickY),
				Math.hypot(canvas.width - clickX, clickY),
				Math.hypot(clickX, canvas.height - clickY),
				Math.hypot(canvas.width - clickX, canvas.height - clickY),
			);
			const maxDist = Math.max(distToMargin + 50, 1);
			const duration = animationDuration;
			const startTime = performance.now();
			function animate(now: number) {
				if (!ctx) return;
				const elapsed = now - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const radius = Math.max(progress * maxDist, 0);
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				drawSpoiler(ctx, canvas);
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.beginPath();
				ctx.arc(clickX, clickY, radius, 0, 2 * Math.PI);
				ctx.fill();
				ctx.restore();
				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					onReveal();
				}
			}
			requestAnimationFrame(animate);
		},
		[onReveal, originalImage, drawSpoiler, animationDuration],
	);

	useEffect(() => {
		if (!visible) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const spoiler = DotRenderer.createSpoiler({
			width: rect.width,
			height: rect.height,
			onPlay: () => {},
			onPause: () => {},
			onDestroy: () => {},
		});
		spoilerRef.current = spoiler;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		spoiler.readyResult.then(() => {
			const draw = () => {
				const ctx = canvas.getContext("2d");
				if (!ctx || !spoilerRef.current || !originalImage) return;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				drawSpoiler(ctx, canvas);
				requestAnimationFrame(draw);
			};
			draw();
			spoiler.animation.play();
		});
		canvas.addEventListener("click", handleClick);
		return () => {
			canvas.removeEventListener("click", handleClick);
			spoiler.animation.destroy();
			spoilerRef.current = null;
		};
	}, [visible, handleClick, originalImage, drawSpoiler]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? "auto" : "none",
				zIndex: 2,
				cursor: "pointer",
				borderRadius: 10,
				display: "block",
			}}
		/>
	);
};

export default SpoilerOverlay;
