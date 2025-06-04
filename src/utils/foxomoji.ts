import emojiData from "unicode-emoji-json";

export type EmojiVersion = "" | "14" | "15" | "15.1";

export type Emoji = {
	code: string;
	char: string;
	name: string;
	category: string;
	group: string;
	subgroup: string;
	version?: EmojiVersion;
};

const emojiToCode = (emoji: string): string => {
	return Array.from(emoji)
		.map((char) => char.codePointAt(0)?.toString(16))
		.filter(Boolean)
		.join("-");
};

class Foxomoji {
	private readonly emojis: Emoji[];

	constructor() {
		this.emojis = Object.entries(emojiData)
			.filter(() => true)
			.map(([char, data]: [string, any]) => {
				const code = emojiToCode(char);
				const version = (data.emoji_version ?? "") as EmojiVersion;

				return {
					code,
					char,
					name: data.name,
					category: data.group,
					group: data.group,
					subgroup: data.subgroup,
					version,
				};
			});
	}

	getEmojiByCode(code: string): Emoji | undefined {
		return this.emojis.find(
			(emoji) => emoji.code.toLowerCase() === code.toLowerCase(),
		);
	}

	getAllEmojis(): Emoji[] {
		return this.emojis;
	}
}

export const foxomoji = new Foxomoji();
