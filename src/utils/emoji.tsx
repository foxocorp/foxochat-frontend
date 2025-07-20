import appStore from "@store/app";
import type { JSX } from "preact";
import { foxomoji } from "./foxomoji";

const emojis = foxomoji
	.getAllEmojis()
	.sort((a, b) => b.char.length - a.char.length);

export const isAppleDevice = (): boolean => {
	const userAgent = navigator.userAgent.toLowerCase();
	return /macintosh|ipad|iphone|ipod/.test(userAgent);
};

function stripFE0F(code: string): string {
	return code
		.split("-")
		.filter((part) => part.toLowerCase() !== "fe0f")
		.join("-");
}

export function isOnlyEmojis(text: string): {
	onlyEmojis: boolean;
	count: number;
} {
	let cursor = 0;
	let emojiCount = 0;
	const trimmed = text.trim();
	while (cursor < trimmed.length) {
		let matched = false;
		for (const emoji of emojis) {
			if (trimmed.startsWith(emoji.char, cursor)) {
				emojiCount++;
				cursor += emoji.char.length;
				matched = true;
				break;
			}
		}
		if (!matched) {
			if (trimmed[cursor] !== " " && trimmed[cursor] !== "\n") {
				return { onlyEmojis: false, count: 0 };
			}
			cursor++;
		}
	}
	return { onlyEmojis: emojiCount > 0, count: emojiCount };
}

export const renderEmojisToJSX = (
	text: string,
	forceSmall?: boolean,
	size?: number,
): (string | JSX.Element)[] => {
	const result: (string | JSX.Element)[] = [];
	let cursor = 0;
	const useLargeEmoji = appStore.appearanceSettings.largeEmoji;

	let emojiCount = 0;
	let onlyEmojis = false;
	if (!forceSmall && useLargeEmoji) {
		const res = isOnlyEmojis(text);
		onlyEmojis = res.onlyEmojis;
		emojiCount = res.count;
	}

	while (cursor < text.length) {
		let matchedEmoji = emojis.find((emoji) =>
			text.startsWith(emoji.char, cursor),
		);
		if (matchedEmoji) {
			const key = `${matchedEmoji.code}-${cursor}`;
			let emojiClass = "emoji";
			if (size) {
				emojiClass += " emoji-custom";
			} else if (forceSmall || !useLargeEmoji) {
				emojiClass += " emoji-small";
			} else if (onlyEmojis && emojiCount > 0 && emojiCount < 4) {
				emojiClass += " emoji-large";
			} else {
				emojiClass += " emoji-small";
			}
			if (isAppleDevice()) {
				result.push(
					<span
						key={key}
						className={emojiClass + " emoji-native"}
						style={
							size
								? {
										fontSize: `${size}px`,
										width: `${size}px`,
										height: `${size}px`,
									}
								: undefined
						}
					>
						{matchedEmoji.char}
					</span>,
				);
			} else {
				const actualCode = stripFE0F(matchedEmoji.code);
				result.push(
					<img
						key={key}
						src={`/assets/img/emoji/${actualCode}.png`}
						className={emojiClass + " emoji-image"}
						alt={matchedEmoji.char}
						draggable={false}
						style={
							size ? { width: `${size}px`, height: `${size}px` } : undefined
						}
					/>,
				);
			}
			cursor += matchedEmoji.char.length;
		} else {
			const char = text[cursor];
			if (char !== undefined) result.push(char);
			cursor++;
		}
	}
	return result;
};
