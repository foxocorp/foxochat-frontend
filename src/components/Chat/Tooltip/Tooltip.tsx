import { TooltipProps } from "@interfaces/interfaces";
import clsx from "clsx";
import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import styles from "./Tooltip.module.scss";

const tryPositions: Array<"top" | "bottom" | "left" | "right"> = [
	"top",
	"bottom",
	"right",
	"left",
];

export function Tooltip({
	children,
	text,
	className,
	position = "auto",
}: TooltipProps): JSX.Element {
	const [isMounted, setIsMounted] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState({ top: 0, left: 0 });
	const [computedPosition, setComputedPosition] = useState<
		"top" | "bottom" | "left" | "right"
	>("top");

	const wrapperRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isMounted && wrapperRef.current && tooltipRef.current) {
			const rect = wrapperRef.current.getBoundingClientRect();
			const tooltip = tooltipRef.current;
			const spacing = 8;
			const vw = window.innerWidth;
			const vh = window.innerHeight;

			let finalPosition: "top" | "bottom" | "left" | "right" =
				position !== "auto" ? position : "top";

			if (position === "auto") {
				finalPosition =
					tryPositions.find((pos) => {
						switch (pos) {
							case "top":
								return rect.top >= tooltip.offsetHeight + spacing;
							case "bottom":
								return rect.bottom + tooltip.offsetHeight + spacing <= vh;
							case "left":
								return rect.left >= tooltip.offsetWidth + spacing;
							case "right":
								return rect.right + tooltip.offsetWidth + spacing <= vw;
						}
					}) || "top";
			}

			setComputedPosition(finalPosition);

			const top = (() => {
				switch (finalPosition) {
					case "top":
						return rect.top - tooltip.offsetHeight - spacing;
					case "bottom":
						return rect.bottom + spacing;
					case "left":
					case "right":
						return rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
				}
			})();

			const left = (() => {
				switch (finalPosition) {
					case "left":
						return rect.left - tooltip.offsetWidth - spacing;
					case "right":
						return rect.right + spacing;
					case "top":
					case "bottom":
						return rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
				}
			})();

			setCoords({ top, left });
		}
	}, [isMounted, position]);

	const showTooltip = () => {
		setIsMounted(true);
		requestAnimationFrame(() => {
			setIsVisible(true);
		});
	};

	const hideTooltip = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsMounted(false);
		}, 200);
	};

	return (
		<div
			ref={wrapperRef}
			className={clsx(styles.wrapper, className)}
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
		>
			{children}
			{isMounted && (
				<div
					ref={tooltipRef}
					className={clsx(
						styles.bubble,
						styles[computedPosition],
						isVisible && styles.visible,
					)}
					style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
				>
					{text}
				</div>
			)}
		</div>
	);
}
