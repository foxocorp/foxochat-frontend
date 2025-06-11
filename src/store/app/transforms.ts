import {
	APIChannel,
	APIMember,
	APIMessage,
	APIUser,
	ChannelType,
	MemberPermissions,
	UserFlags,
	UserType,
} from "foxochat.js";

const FALLBACK_USER: APIUser = {
	id: 0,
	display_name: "",
	channels: [],
	avatar: "",
	username: "unknown",
	email: "",
	flags: UserFlags.Disabled,
	type: UserType.User,
	created_at: 0,
};

const FALLBACK_CHANNEL: APIChannel = {
	id: 0,
	name: "",
	display_name: "",
	icon: "",
	type: ChannelType.DM,
	member_count: 0,
	owner: FALLBACK_USER,
	created_at: 0,
};

export function normalizePermissions(permissions: string | number): number {
	if (typeof permissions === "string") {
		const n = parseInt(permissions, 10);
		return isNaN(n) ? MemberPermissions.SendMessages : n;
	}
	return permissions;
}

export function normalizeChannelType(type?: string | number): ChannelType {
	const num = typeof type === "string" ? parseInt(type, 10) : type;

	if (typeof num === "number" && num in ChannelType) {
		return num as ChannelType;
	}

	return ChannelType.DM;
}

export function transformApiUserToUser(u: APIUser | undefined): APIUser {
	return { ...FALLBACK_USER, ...(u ?? {}) };
}

export function transformApiMember(raw: APIMember | undefined): APIMember {
	if (!raw || typeof raw !== "object") {
		return {
			id: 0,
			user: FALLBACK_USER,
			channel: FALLBACK_CHANNEL,
			permissions: MemberPermissions.SendMessages,
			joined_at: 0,
		};
	}

	const ch = typeof raw.channel === "object" ? raw.channel : undefined;
	const safeChannel: APIChannel = {
		...FALLBACK_CHANNEL,
		...(ch ?? {}),
		type: normalizeChannelType(ch?.type),
		owner: transformApiUserToUser(ch?.owner),
	};

	return {
		id: raw.id,
		user: transformApiUserToUser(raw.user),
		channel: safeChannel,
		permissions: normalizePermissions(raw.permissions),
		joined_at: raw.joined_at,
	};
}

export function transformToMessage(raw: unknown): APIMessage {
	if (!raw || typeof raw !== "object") {
		return {
			id: 0,
			content: "",
			attachments: [],
			author: transformApiMember(undefined),
			channel: FALLBACK_CHANNEL,
			created_at: 0,
		};
	}

	const message = raw as Partial<APIMessage>;

	const ch = typeof message.channel === "object" ? message.channel : undefined;
	const safeChannel: APIChannel = {
		...FALLBACK_CHANNEL,
		...(ch ?? {}),
		type: normalizeChannelType(ch?.type),
		owner: transformApiUserToUser(ch?.owner),
	};

	return {
		id: message.id ?? 0,
		content: message.content ?? "",
		attachments: message.attachments ?? [],
		author: transformApiMember(message.author),
		channel: safeChannel,
		created_at: message.created_at ?? 0,
	};
}

export function createChannelFromAPI(c: APIChannel): APIChannel | null {
	try {
		const channel: APIChannel = {
			id: c.id,
			name: c.name,
			display_name: c.display_name,
			icon: c.icon,
			type: normalizeChannelType(c.type),
			member_count: c.member_count,
			owner: transformApiUserToUser(c.owner),
			created_at: c.created_at,
		};

		if (c.last_message) {
			channel.last_message = transformToMessage(c.last_message);
		}

		return channel;
	} catch (e) {
		console.error("createChannelFromAPI error:", e);
		return null;
	}
}
