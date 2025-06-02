import { JSX } from "preact";
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

export const renderEmojisToJSX = (text: string): (string | JSX.Element)[] => {
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
					const actualCode = stripFE0F(emoji.code);
					result.push(
						<img
							key={key}
							src={`/assets/img/emoji/${actualCode}.png`}
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
