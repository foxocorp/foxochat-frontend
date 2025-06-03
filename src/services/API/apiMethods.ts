import { generateThumbHashFromFile } from "@utils/functions";
import Client, {
	APIChannel,
	APIMessage,
	APIUser,
	ChannelType,
	MemberKey,
	RESTGetAPIMessageListQuery,
	RESTPostAPIMessageBody,
	RESTPutAPIMessageAttachmentsBody,
} from "foxogram.js";

export const getAuthToken = (): string | null =>
	localStorage.getItem("authToken");
const setAuthToken = (token: string): void =>
	localStorage.setItem("authToken", token);
export const removeAuthToken = (): void => localStorage.removeItem("authToken");

const hostname = window.location.hostname;

const apiUrl =
	hostname === "localhost" || hostname.endsWith("dev.foxogram.su")
		? "https://api.dev.foxogram.su"
		: hostname.endsWith("foxogram.su")
			? "https://api.foxogram.su"
			: "https://api.dev.foxogram.su";

const client = new Client({
	api: {
		rest: {
			baseURL: apiUrl,
		},
	},
});

const token = getAuthToken();
if (token) {
	void client.login(token);
}

export interface AttachmentResponse {
	id: number;
	uploadUrl: string;
}

async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (error: any) {
		if (error.status === 401) {
			removeAuthToken();
		}
		throw error;
	}
}

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function toFullUrl(relativeOrFullUrl: string, baseUrl: string): string {
	try {
		return isValidUrl(relativeOrFullUrl)
			? relativeOrFullUrl
			: new URL(relativeOrFullUrl, baseUrl).toString();
	} catch (error) {
		console.error("Failed to construct full URL:", {
			relativeOrFullUrl,
			baseUrl,
			error,
		});
		throw new Error(`Invalid URL: ${relativeOrFullUrl}`);
	}
}

export const apiMethods = {
	login: async (email: string, password: string) => {
		const t = await client.api.auth.login({ email, password });
		setAuthToken(t.access_token);
		await client.login(t.access_token);
		return t;
	},
	register: async (username: string, email: string, password: string) => {
		const t = await client.api.auth.register({ username, email, password });
		setAuthToken(t.access_token);
		await client.login(t.access_token);
		return t;
	},
	resendEmailVerification: () => client.api.auth.resendEmail(),
	resetPassword: (email: string) => client.api.auth.resetPassword({ email }),
	confirmResetPassword: (email: string, code: string, new_password: string) =>
		client.api.auth.resetPasswordConfirm({ email, code, new_password }),
	verifyEmail: (code: string) => client.api.auth.verifyEmail({ otp: code }),

	getCurrentUser: async (): Promise<APIUser> =>
		withErrorHandling(() => client.api.user.current()),
	editUser: (body: { username?: string; email?: string }) =>
		client.api.user.edit(body),
	deleteUser: async (body: { password: string }) => {
		await client.api.user.delete(body);
		removeAuthToken();
	},
	confirmDeleteUser: (body: { password: string; code: string }) =>
		client.api.user.confirmDelete(body),
	userChannelsList: (): Promise<APIChannel[]> => client.api.user.channels(),

	createChannel: (body: {
		display_name: string;
		name: string;
		type: ChannelType;
	}) => client.api.channel.create(body),
	deleteChannel: (channelId: number) => client.api.channel.delete(channelId),
	editChannel: (channelId: number, body: { name?: string }) =>
		client.api.channel.edit(channelId, body),
	getChannel: (channelId: number) => client.api.channel.get(channelId),
	joinChannel: (channelId: number) => client.api.channel.join(channelId),
	leaveChannel: (channelId: number) => client.api.channel.leave(channelId),
	getChannelMember: (channelId: number, memberKey: MemberKey) =>
		client.api.channel.member(channelId, memberKey),
	listChannelMembers: (channelId: number) =>
		client.api.channel.members(channelId),
	listMessages: (
		channelId: number,
		query?: RESTGetAPIMessageListQuery,
	): Promise<APIMessage[]> => client.api.message.list(channelId, query),
	getMessage: (channelId: number, messageId: number) =>
		client.api.message.get(channelId, messageId),

	createMessage: async (
		channelId: number,
		content: string,
		attachmentIds: number[] = [],
	): Promise<APIMessage> => {
		const body: RESTPostAPIMessageBody = {
			content,
			attachments: attachmentIds,
		};
		return await client.api.message.create(channelId, body);
	},

	uploadFileToStorage: async (uploadUrl: string, file: File): Promise<void> => {
		console.log("Raw uploadUrl:", uploadUrl);
		const fullUploadUrl = toFullUrl(uploadUrl, apiUrl);
		console.log("Full uploadUrl:", fullUploadUrl);

		if (!isValidUrl(fullUploadUrl)) {
			throw new Error(`Invalid upload URL after processing: ${fullUploadUrl}`);
		}

		const resp = await fetch(fullUploadUrl, {
			method: "PUT",
			headers: { "Content-Type": file.type },
			body: file,
		});
		if (!resp.ok) throw new Error(`Upload failed: ${resp.statusText}`);
	},

	createMessageAttachments: async (
		channelId: number,
		files: File[],
	): Promise<AttachmentResponse[]> => {
		const body: RESTPutAPIMessageAttachmentsBody = await Promise.all(
			files.map(async (file) => ({
				filename: file.name,
				content_type: file.type,
				thumbhash: await generateThumbHashFromFile(file),
			})),
		);

		const res = await client.api.message.createAttachments(channelId, body);

		console.log("API response for attachments:", res);

		return res.map((r) => {
			if (!r.url) {
				throw new Error("Missing upload URL in API response");
			}
			return { id: r.id, uploadUrl: r.url };
		});
	},

	editMessage: (
		channelId: number,
		messageId: number,
		body: { content?: string; attachments?: number[] },
	): Promise<APIMessage> => {
		return client.api.message.edit(channelId, messageId, {
			content: body.content,
			attachments: body.attachments,
		});
	},

	deleteMessage: (channelId: number, messageId: number) =>
		client.api.message.delete(channelId, messageId),
};
