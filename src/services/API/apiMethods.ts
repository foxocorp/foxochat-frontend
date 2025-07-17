import { client } from "@services/FoxoChatClient";
import { generateThumbHashFromFile } from "@utils/functions";
import { toFullUrl, isValidUrl } from "@utils/apiHelpers";
import type {
    APIChannel,
    APIMessage,
    APIUser,
    ChannelType,
    MemberKey,
    RESTGetAPIMessageListQuery,
    RESTPostAPIMessageBody,
    RESTPutAPIMessageAttachmentsBody,
    RESTPatchAPIUserBody,
    PublicUserKey,
} from "foxochat.js";

export const getAuthToken = (): string | null => localStorage.getItem("authToken");
export const setAuthToken = (token: string): void => localStorage.setItem("authToken", token);
export const removeAuthToken = (): void => localStorage.removeItem("authToken");

export interface AttachmentResponse {
    id: number;
    uploadUrl: string;
}

async function withAuthHandling<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (error.status === 401) removeAuthToken();
        throw error;
    }
}

export const apiMethods = {
    login: async (identity: string, password: string) => {
        const t = await client.api.auth.login({ identity, password });
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

    getCurrentUser: (): Promise<APIUser> => withAuthHandling(() => client.api.user.current()),
    editUser: (body: RESTPatchAPIUserBody) => client.api.user.edit(body),
    deleteUser: async (body: { password: string }) => {
        await client.api.user.delete(body);
        removeAuthToken();
    },
    confirmDeleteUser: (body: { password: string; code: string }) => client.api.user.confirmDelete(body),
    userChannelsList: (): Promise<APIChannel[]> => client.api.user.channels(),

    createChannel: (body: {
        display_name: string;
        name: string;
        public: boolean;
        type: ChannelType;
    }) => client.api.channel.create(body),
    deleteChannel: (channelId: number) => client.api.channel.delete(channelId),
    editChannel: (channelId: number, body: { name?: string }) => client.api.channel.edit(channelId, body),
    getChannel: (channelId: number) => client.api.channel.get(channelId),
    joinChannel: (channelId: number) => client.api.channel.join(channelId),
    leaveChannel: (channelId: number) => client.api.channel.leave(channelId),
    getChannelMember: (channelId: number, memberKey: MemberKey) => client.api.channel.member(channelId, memberKey),
    listChannelMembers: (channelId: number) => client.api.channel.members(channelId),
    listMessages: (channelId: number, query?: RESTGetAPIMessageListQuery): Promise<APIMessage[]> => client.api.message.list(channelId, query),
    getMessage: (channelId: number, messageId: number) => client.api.message.get(channelId, messageId),

    createMessage: async (
        channelId: number,
        content: string,
        attachmentIds: number[] = [],
    ): Promise<APIMessage> => {
        const body: RESTPostAPIMessageBody = { content, attachments: attachmentIds };
        return client.api.message.create(channelId, body);
    },

    uploadFileToStorage: async (uploadUrl: string, file: File): Promise<void> => {
        const fullUploadUrl = toFullUrl(uploadUrl, client.api.rest.options.baseURL);
        if (!isValidUrl(fullUploadUrl)) throw new Error(`Invalid upload URL after processing: ${fullUploadUrl}`);
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
        flags: number[] = [],
    ): Promise<AttachmentResponse[]> => {
        const body: RESTPutAPIMessageAttachmentsBody = await Promise.all(
            files.map(async (file, i) => ({
                filename: file.name,
                content_type: file.type,
                thumbhash: (await generateThumbHashFromFile(file)) ?? "",
                flags: flags[i] ?? 0,
                spoiler: false,
            })),
        );
        const res = await client.api.message.createAttachments(channelId, body);
        return res.map((r) => {
            if (!r.url) throw new Error("Missing upload URL in API response");
            return { id: r.id, uploadUrl: r.url };
        });
    },

    editMessage: (
        channelId: number,
        messageId: number,
        body: { content?: string; attachments?: number[] },
    ): Promise<APIMessage> => client.api.message.edit(
        channelId,
        messageId,
        {
            ...(body.content !== undefined ? { content: body.content } : {}),
            ...(body.attachments !== undefined ? { attachments: body.attachments } : {}),
        },
    ),

    deleteMessage: (channelId: number, messageId: number) => client.api.message.delete(channelId, messageId),

    checkChannelNameAvailability: (channelName: string) => {
        const channelKey = channelName.startsWith("@") ? channelName : `@${channelName}`;
        return client.api.channel.get(channelKey as `@${string}`);
    },
    getUserById: (id: number) => client.api.user.get(id),
    getUserByUsername: (username: string) => client.api.user.get(username as PublicUserKey),
};