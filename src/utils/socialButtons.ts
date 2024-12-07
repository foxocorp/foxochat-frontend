export interface SocialButton {
	icon: string;
	label: string;
	action: () => void;
}

export function getSocialButtons(): SocialButton[] {
	return [
		{ icon: "/src/assets/svg/google.svg", label: "Google", action: () => alert("Google clicked") },
		{ icon: "/src/assets/svg/discord.svg", label: "Discord", action: () => alert("Discord clicked") },
		{ icon: "/src/assets/svg/telegram.svg", label: "Telegram", action: () => alert("Telegram clicked") },
		{ icon: "/src/assets/svg/github.svg", label: "GitHub", action: () => alert("GitHub clicked") },
		{ icon: "/src/assets/svg/meta.svg", label: "Meta", action: () => alert("Meta clicked") },
		{ icon: "/src/assets/svg/apple.svg", label: "Apple", action: () => alert("Apple clicked") },
	];
}
