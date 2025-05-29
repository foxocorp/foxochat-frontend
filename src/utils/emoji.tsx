import foxomoji from "foxomoji";
import { JSX } from "preact";

const emojis = foxomoji.getAllEmojis();
/**
 * Checks if the device is Apple (macOS or iOS).
 * @returns true, if device Apple, else false.
 */
export const isAppleDevice = (): boolean => {
	const userAgent = navigator.userAgent.toLowerCase();
	return /macintosh|ipad|iphone|ipod/.test(userAgent);
};

/**
 * Replaces all text emojis with JSX elements from the foxomoji library.
 * On Apple devices, uses native emoji characters inside a <span>,
 * otherwise renders custom emoji images via <img>.
 * @param text - The input text containing emojis.
 * @param resolution - The resolution of the emoji images (either '64' or '160').
 * @returns An array of strings and JSX elements representing the processed content.
 */
export const renderEmojisToJSX = (
	text: string,
	resolution: "64" | "160" = "64",
): (string | JSX.Element)[] => {
	const result: (string | JSX.Element)[] = [];
	let cursor = 0;

	while (cursor < text.length) {
		let matched = false;

		for (const emoji of emojis) {
			if (text.startsWith(emoji.char, cursor)) {
				const key = `${emoji.code}-${cursor}`;

				if (isAppleDevice()) {
					result.push(
						<span key={key} className="emoji emoji-native">
							{emoji.char}
						</span>,
					);
				} else {
					result.push(
						<img
							key={key}
							src={`/foxomoji/emoji-${resolution}/${emoji.code}.png`}
							className="emoji emoji-image"
							alt={emoji.char}
							draggable={false}
						/>,
					);
				}

				cursor += emoji.char.length;
				matched = true;
				break;
			}
		}

		if (!matched) {
			const char = text[cursor];
			if (char !== undefined) {
				result.push(char);
			}
			cursor += 1;
		}
	}

	return result;
};

/**
 * Replaces all text emojis with image emojis from the foxomoji library.
 * @param text - The input text containing emojis.
 * @param resolution - The resolution of the emoji images (either '64' or '160').
 * @returns The text with emojis replaced by image tags, unless on Apple devices.
 */
export const replaceEmojis = (
	text: string,
	resolution: "64" | "160" = "64",
): string => {
	if (isAppleDevice()) {
		const emojis = foxomoji.getAllEmojis();
		let result = text;

		for (const emoji of emojis) {
			const spanTag = `<span class="emoji emoji-native">${emoji.char}</span>`;
			result = result.replace(
				new RegExp(escapeRegExp(emoji.char), "g"),
				spanTag,
			);
		}
		return result;
	}

	const emojis = foxomoji.getAllEmojis();
	let result = text;

	for (const emoji of emojis) {
		const imgTag = `<img src="/foxomoji/emoji-${resolution}/${emoji.code}.png" class="emoji emoji-image" alt="${emoji.char}" draggable="false">`;
		result = result.replace(new RegExp(escapeRegExp(emoji.char), "g"), imgTag);
	}

	return result;
};

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param string - The string to escape.
 * @returns The escaped string.
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
