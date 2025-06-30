import { MediaViewerProps } from "@interfaces/interfaces";
import React, { createPortal, memo } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import * as styles from "./MediaViewer.module.scss";

import CloseIcon from "@/assets/icons/left-bar/navigation/close.svg";
import NextIcon from "@/assets/icons/right-bar/chat/next.svg";
import DownloadIcon from "@/assets/icons/right-bar/mediaViewer/download.svg";
import PrevIcon from "@/assets/icons/right-bar/mediaViewer/prev.svg";
import ShareIcon from "@/assets/icons/right-bar/mediaViewer/share.svg";
import DeleteIcon from "@/assets/icons/right-bar/mediaViewer/trash.svg";
import ZoomInIcon from "@/assets/icons/right-bar/mediaViewer/zoom-in.svg";
import ZoomOutIcon from "@/assets/icons/right-bar/mediaViewer/zoom-out.svg";
import { timestampToHSV } from "@utils/functions";

const MediaViewer = ({
	isOpen,
	attachments,
	initialIndex,
	authorName,
	authorAvatar,
	createdAt,
	onClose,
	onDelete,
}: MediaViewerProps) => {
	const validInitialIndex = Math.max(
		0,
		Math.min(initialIndex, attachments.length - 1),
	);
	const [currentIndex, setCurrentIndex] = useState<number>(validInitialIndex);
	const [scale, setScale] = useState<number>(1);
	const [isZooming, setIsZooming] = useState<boolean>(false);
	const [position, setPosition] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [wasDragged, setWasDragged] = useState<boolean>(false);
	const [resettingPosition, setResettingPosition] = useState<boolean>(false);
	const dragStartRef = useRef<{ x: number; y: number } | null>(null);
	const viewerRef = useRef<HTMLDivElement>(null);
	const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
	const zoomInputRef = useRef<HTMLInputElement>(null);
	const avatarUrl = authorAvatar
		? `${config.cdnBaseUrl}${authorAvatar}`
		: undefined;

	const { background: backgroundColor } = timestampToHSV(createdAt);

	const minScale = 0.5;
	const maxScale = 4;
	const zoomStep = 0.2;
	const resetScaleThreshold = 1.1;
	const panSensitivity = 1;

	useEffect(() => {
		if (isOpen && attachments.length > 0) {
			const newIndex = Math.max(
				0,
				Math.min(initialIndex, attachments.length - 1),
			);
			setCurrentIndex(newIndex);
			setScale(1);
			setIsZooming(false);
			setPosition({ x: 0, y: 0 });
			setWasDragged(false);
			setResettingPosition(false);
			if (mediaRef.current) {
				mediaRef.current.style.opacity = "0";
				setTimeout(() => {
					if (mediaRef.current) {
						mediaRef.current.style.transition = "opacity 0.3s ease";
						mediaRef.current.style.opacity = "1";
					}
				}, 10);
			}
		}
	}, [isOpen, initialIndex, attachments.length]);

	useEffect(() => {
		return () => {
			setScale(1);
			setIsZooming(false);
			setPosition({ x: 0, y: 0 });
			setWasDragged(false);
			setResettingPosition(false);
			setCurrentIndex(validInitialIndex);
			if (mediaRef.current) {
				mediaRef.current.style.opacity = "0";
				mediaRef.current.style.transition = "";
			}
		};
	}, []);

	const handleClose = () => {
		setScale(1);
		setIsZooming(false);
		setPosition({ x: 0, y: 0 });
		setWasDragged(false);
		setResettingPosition(false);
		onClose();
	};

	const handleZoom = (newScale: number): void => {
		const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
		setScale(clampedScale);
		setIsZooming(clampedScale !== 1);
		if (clampedScale <= resetScaleThreshold) {
			setResettingPosition(true);
			setPosition({ x: 0, y: 0 });
		} else {
			setResettingPosition(false);
		}
		setWasDragged(false);
	};

	const calculateBounds = () => {
		if (!mediaRef.current || !viewerRef.current) return { maxX: 0, maxY: 0 };

		const viewerRect = viewerRef.current.getBoundingClientRect();
		const mediaRect = mediaRef.current.getBoundingClientRect();

		const scaledWidth = mediaRect.width * scale;
		const scaledHeight = mediaRect.height * scale;
		const maxX = Math.max(0, (scaledWidth - viewerRect.width) / (2 * scale));
		const maxY = Math.max(0, (scaledHeight - viewerRect.height) / (2 * scale));

		return { maxX, maxY };
	};

	const handlePan = (deltaX: number, deltaY: number): void => {
		if (!isZooming) return;

		const { maxX, maxY } = calculateBounds();
		if (!maxX && !maxY) return;

		const adjustedDeltaX = (deltaX * panSensitivity) / scale;
		const adjustedDeltaY = (deltaY * panSensitivity) / scale;

		let newX = position.x - adjustedDeltaX;
		let newY = position.y - adjustedDeltaY;

		newX = Math.max(-maxX, Math.min(maxX, newX));
		newY = Math.max(-maxY, Math.min(maxY, newY));

		setPosition({ x: newX, y: newY });
		setWasDragged(true);
	};

	const handleWheel = (e: WheelEvent): void => {
		e.preventDefault();

		const isPinch = e.ctrlKey;
		const isTouchpad =
			!isPinch &&
			e.deltaMode === 0 &&
			(Math.abs(e.deltaY) < 50 || Math.abs(e.deltaX) < 50);

		if (isTouchpad && isZooming) {
			handlePan(e.deltaX, e.deltaY);
		} else {
			const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
			handleZoom(scale + delta);
		}
	};

	useEffect(() => {
		const viewer = viewerRef.current;
		if (!viewer || !isOpen) return;
		viewer.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			viewer.removeEventListener("wheel", handleWheel);
		};
	}, [isOpen, scale, isZooming, position]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent): void => {
			if (e.key === "Escape" && isOpen) {
				handleClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	const prevMedia = (): void => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
			setScale(1);
			setIsZooming(false);
			setPosition({ x: 0, y: 0 });
			setWasDragged(false);
			setResettingPosition(false);
		}
	};

	const nextMedia = (): void => {
		if (currentIndex < attachments.length - 1) {
			setCurrentIndex(currentIndex + 1);
			setScale(1);
			setIsZooming(false);
			setPosition({ x: 0, y: 0 });
			setWasDragged(false);
			setResettingPosition(false);
		}
	};

	const handleGestureStart = (e: Event): void => {
		e.preventDefault();
	};

	const handleGestureChange = (e: any): void => {
		e.preventDefault();
		const scaleFactor =
			e.scale > 1 ? 1 + (e.scale - 1) * 0.5 : 1 / (1 + (1 - e.scale) * 0.5);
		const newScale = Math.max(
			minScale,
			Math.min(maxScale, scale * scaleFactor),
		);
		handleZoom(newScale);
	};

	useEffect(() => {
		const movers = viewerRef.current;
		if (!movers || !isOpen) return;
		movers.addEventListener("gesturestart", handleGestureStart, {
			passive: false,
		});
		movers.addEventListener("gesturechange", handleGestureChange, {
			passive: false,
		});
		return () => {
			movers.removeEventListener("gesturestart", handleGestureStart);
			movers.removeEventListener("gesturechange", handleGestureChange);
		};
	}, [isOpen, scale]);

	const handleTouchStart = (e: TouchEvent): void => {
		if (e.touches.length === 2) {
			e.preventDefault();
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const distance = Math.hypot(
				touch2.pageX - touch1.pageX,
				touch2.pageY - touch1.pageY,
			);
			(e.currentTarget as HTMLElement).dataset.initialDistance =
				distance.toString();
		}
	};

	const handleTouchMove = (e: TouchEvent): void => {
		if (e.touches.length === 2) {
			e.preventDefault();
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const distance = Math.hypot(
				touch2.pageX - touch1.pageX,
				touch2.pageY - touch1.pageY,
			);
			const initialDistance = parseFloat(
				(e.currentTarget as HTMLElement).dataset.initialDistance ?? "1",
			);
			const scaleFactor = distance / initialDistance;
			const newScale = Math.max(
				minScale,
				Math.min(maxScale, scale * scaleFactor),
			);
			handleZoom(newScale);
			(e.currentTarget as HTMLElement).dataset.initialDistance =
				distance.toString();
		}
	};

	const handleMouseDown = (e: MouseEvent): void => {
		if (zoomInputRef.current?.contains(e.target as Node)) {
			return;
		}
		if (isZooming) {
			e.preventDefault();
			setIsDragging(true);
			setWasDragged(false);
			dragStartRef.current = { x: e.clientX, y: e.clientY };
		}
	};

	const handleMouseMove = (e: MouseEvent): void => {
		if (
			isDragging &&
			dragStartRef.current &&
			mediaRef.current &&
			viewerRef.current
		) {
			e.preventDefault();
			const { maxX, maxY } = calculateBounds();
			if (!maxX && !maxY) return;

			const deltaX = (e.clientX - dragStartRef.current.x) / scale;
			const deltaY = (e.clientY - dragStartRef.current.y) / scale;
			let newX = position.x + deltaX;
			let newY = position.y + deltaY;

			newX = Math.max(-maxX, Math.min(maxX, newX));
			newY = Math.max(-maxY, Math.min(maxY, newY));

			setPosition({ x: newX, y: newY });
			setWasDragged(true);

			dragStartRef.current = { x: e.clientX, y: e.clientY };
		}
	};

	const handleMouseUp = (): void => {
		setIsDragging(false);
		dragStartRef.current = null;
	};

	useEffect(() => {
		const movers = viewerRef.current;
		if (!movers || !isOpen) return;
		movers.addEventListener("mousedown", handleMouseDown);
		movers.addEventListener("mousemove", handleMouseMove);
		movers.addEventListener("mouseup", handleMouseUp);
		movers.addEventListener("mouseleave", handleMouseUp);
		return () => {
			movers.removeEventListener("mousedown", handleMouseDown);
			movers.removeEventListener("mousemove", handleMouseMove);
			movers.removeEventListener("mouseup", handleMouseUp);
			movers.removeEventListener("mouseleave", handleMouseUp);
		};
	}, [isOpen, isZooming, isDragging, position, scale]);

	const handleMediaClick = (e: MouseEvent): void => {
		e.stopPropagation();
		if (!wasDragged) {
			handleClose();
		}
	};

	const handleMoversClick = (e: MouseEvent): void => {
		if (e.target !== mediaRef.current) {
			handleClose();
		}
	};

	if (
		!isOpen ||
		!attachments.length ||
		currentIndex < 0 ||
		currentIndex >= attachments.length
	) {
		return null;
	}

	const currentAttachment = attachments[currentIndex];
	if (!currentAttachment?.uuid) {
		return null;
	}

	const url = `${config.cdnBaseUrl}${currentAttachment.uuid}`;
	const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(
		currentAttachment.content_type.split("/")[1] ?? "",
	);

	const handleDownload = async (): Promise<void> => {
		try {
			const response = await fetch(url, {
				mode: "cors",
				credentials: "omit",
				headers: {
					Accept: currentAttachment.content_type || "*/*",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch file: ${response.statusText}`);
			}

			const blob = await response.blob();
			const extension = currentAttachment.content_type.split("/")[1] ?? "file";
			const filename =
				currentAttachment.filename ||
				`attachment_${currentAttachment.uuid}.${extension}`;

			const downloadUrl = window.URL.createObjectURL(blob);
			const iframe = document.createElement("iframe");
			iframe.style.display = "none";
			iframe.src = downloadUrl;
			document.body.appendChild(iframe);

			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			iframe.contentDocument?.body.appendChild(link);
			link.click();

			setTimeout(() => {
				document.body.removeChild(iframe);
				window.URL.revokeObjectURL(downloadUrl);
			}, 100);
		} catch {
			const link = document.createElement("a");
			link.href = url;
			link.download =
				currentAttachment.filename || `attachment_${currentAttachment.uuid}`;
			link.style.display = "none";
			link.setAttribute("rel", "noopener noreferrer");
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const formattedDate = new Date(createdAt).toLocaleString([], {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	const hasCaption = !!currentAttachment.filename;

	const handleDelete = (): void => {
		if (onDelete && currentAttachment) {
			onDelete(currentAttachment);
			handleClose();
		}
	};

	const viewerContent = (
		<div
			ref={viewerRef}
			className={`${styles.mediaViewerWhole} ${isOpen ? styles.active : ""} ${isZooming ? styles.isZooming : ""}`}
		>
			<div className={styles.mediaViewerBackdrop} onClick={handleClose} />
			<div className={styles.mediaViewerContent}>
				<div
					className={`${styles.mediaViewerTopbar} ${styles.mediaViewerAppear}`}
				>
					<div className={styles.mediaViewerTopbarLeft}>
						<button
							className={`${styles.btnIcon} ${styles.onlyHandhelds}`}
							onClick={handleClose}
						>
							<img src={CloseIcon} alt="Close" />
						</button>
						<div className={styles.mediaViewerAuthor}>
							<div className={styles.avatar} style={{ backgroundColor }}>
								{avatarUrl ? (
									<img
										src={avatarUrl}
										className={styles.avatarPhoto}
										alt="Avatar"
									/>
								) : (
									<div className={styles.avatarPlaceholder}>
										{authorName.charAt(0)}
									</div>
								)}
							</div>
							<div>
								<div className={styles.mediaViewerName}>{authorName}</div>
								<div className={styles.mediaViewerDate}>{formattedDate}</div>
							</div>
						</div>
					</div>
					<div className={styles.mediaViewerButtons}>
						{onDelete && (
							<button className={styles.btnIcon} onClick={handleDelete}>
								<img src={DeleteIcon} alt="Delete" />
							</button>
						)}
						<button className={styles.btnIcon} onClick={() => undefined}>
							<img src={ShareIcon} alt="Share" />
						</button>
						<button className={styles.btnIcon} onClick={handleDownload}>
							<img src={DownloadIcon} alt="Download" />
						</button>
						<button
							className={styles.btnIcon}
							onClick={() => {
								handleZoom(scale + zoomStep);
							}}
						>
							<img src={ZoomInIcon} alt="Zoom In" />
						</button>
						<button
							className={styles.btnIcon}
							onClick={() => {
								handleZoom(scale - zoomStep);
							}}
						>
							<img src={ZoomOutIcon} alt="Zoom Out" />
						</button>
						<button className={styles.btnIcon} onClick={handleClose}>
							<img src={CloseIcon} alt="Close" />
						</button>
					</div>
				</div>

				<div
					className={styles.mediaViewerMovers}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onClick={handleMoversClick}
				>
					<div
						className={`${styles.mediaViewerSwitcher} ${styles.mediaViewerSwitcherLeft} ${
							currentIndex === 0 ? styles.hide : ""
						}`}
						onClick={prevMedia}
					>
						<span className={styles.mediaViewerPrevButton}>
							<img src={PrevIcon} alt="Previous" />
						</span>
					</div>
					<div
						className={`${styles.mediaViewerSwitcher} ${styles.mediaViewerSwitcherRight} ${
							currentIndex === attachments.length - 1 ? styles.hide : ""
						}`}
						onClick={nextMedia}
					>
						<span className={styles.mediaViewerNextButton}>
							<img src={NextIcon} alt="Next" />
						</span>
					</div>
					<div
						className={`${styles.mediaViewerMover} ${styles.active} ${
							resettingPosition ? styles.resetting : ""
						}`}
						style={{
							transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
							cursor: isZooming
								? isDragging
									? "grabbing"
									: "grab"
								: "default",
							transition: "transform 0.3s ease",
						}}
					>
						<div className={styles.mediaViewerAspecter}>
							{isImage ? (
								<img
									ref={mediaRef as React.RefObject<HTMLImageElement>}
									src={url}
									className={styles.thumbnail}
									alt="Media"
									onClick={handleMediaClick}
									draggable={false}
								/>
							) : (
								<video
									ref={mediaRef as React.RefObject<HTMLVideoElement>}
									controls
									src={url}
									className={styles.video}
									onClick={handleMediaClick}
								/>
							)}
						</div>
					</div>
				</div>

				<div
					className={`${styles.zoomContainer} ${isZooming ? styles.isVisible : ""}`}
				>
					<button
						className={styles.btnIcon}
						onClick={() => {
							handleZoom(scale - zoomStep);
						}}
					>
						<img src={ZoomOutIcon} alt="Zoom Out" />
					</button>
					<div className={styles.progressLine}>
						<div
							className={styles.progressLineFilled}
							style={{
								width: `${((scale - minScale) / (maxScale - minScale)) * 100}%`,
								transition: "width 0.2s ease",
							}}
						/>
						<input
							ref={zoomInputRef}
							className={styles.progressLineSeek}
							type="range"
							step="0.1"
							min={minScale}
							max={maxScale}
							value={scale}
							onInput={(e) => {
								const newScale = parseFloat(
									(e.target as HTMLInputElement).value,
								);
								handleZoom(newScale);
							}}
							onChange={(e) => {
								const newScale = parseFloat(
									(e.target as HTMLInputElement).value,
								);
								handleZoom(newScale);
							}}
						/>
					</div>
					<button
						className={styles.btnIcon}
						onClick={() => {
							handleZoom(scale + zoomStep);
						}}
					>
						<img src={ZoomInIcon} alt="Zoom In" />
					</button>
				</div>

				{hasCaption && (
					<div
						className={`${styles.mediaViewerCaption} ${isZooming ? styles.hide : ""}`}
					>
						<div className={styles.scrollableY}>
							{currentAttachment.filename}
						</div>
					</div>
				)}
			</div>
		</div>
	);

	return createPortal(viewerContent, document.body);
};

export default memo(MediaViewer);
