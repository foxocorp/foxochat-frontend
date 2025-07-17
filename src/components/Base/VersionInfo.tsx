import { useState } from "preact/hooks";
import { Tooltip } from "@/components/Chat/Tooltip/Tooltip";

const version = `FoxoChat ${__GIT_BRANCH__ === "production" ? "(Stable)" : "(Beta)"} #${__GIT_COMMIT_COUNT__} · ${__GIT_REVISION__}`;

function getBrowserName() {
	const ua = navigator.userAgent;
	if (/chrome|crios|crmo/i.test(ua)) return "Chrome";
	if (/firefox|fxios/i.test(ua)) return "Firefox";
	if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) return "Safari";
	if (/edg/i.test(ua)) return "Edge";
	if (/opr\//i.test(ua)) return "Opera";
	return "Unknown browser";
}

function getWebkitVersionString() {
	const ua = navigator.userAgent;
	const match = ua.match(/AppleWebKit\/(\d+(?:\.\d+)?)/i);
	const browser = getBrowserName();
	return match ? `${browser} (WebKit) ${match[1]}` : `${browser} (WebKit)`;
}

export default function VersionInfo() {
	const [showTooltip, setShowTooltip] = useState(false);
	const webkitShort = getWebkitVersionString();
	const webkitFull = navigator.userAgent;
	const display = (
		<>
			<div>{webkitShort}</div>
			<div style={{ marginTop: 2 }}>{version}</div>
		</>
	);
	const copyString = `${version}\nWebKit: ${webkitFull}`;

	const handleCopy = () => {
		void navigator.clipboard.writeText(copyString);
		setShowTooltip(true);
		setTimeout(() => setShowTooltip(false), 1200);
	};

	const handleMouseDown = (e: MouseEvent) => {
		e.preventDefault();
	};

	return (
		<Tooltip text="Copied!" position="top" show={showTooltip}>
			<div
				style={{
					userSelect: "none",
					textAlign: "center",
					color: "rgb(var(--primary-color-rgb), .25",
					fontSize: 10,
					fontWeight: 400,
					margin: "auto",
					cursor: "pointer",
				}}
				onClick={handleCopy}
				onMouseDown={handleMouseDown}
				title="Click to copy version and WebKit info"
			>
				{display}
			</div>
		</Tooltip>
	);
}
