import { API, REST } from "foxogram.js";
import {
    ChannelType,
    MemberKey,
    APIChannel,
    APIMessage,
    APIUser,
    RESTGetAPIMessageListQuery,
    RESTPutAPIMessageAttachmentsBody,
    RESTPostAPIMessageBody,
} from "@foxogram/api-types";
import { generateThumbHashFromFile } from "@utils/functions";

const isProd = window.location.hostname === "app.foxogram.su";
const apiUrl = isProd
    ? "https://api.foxogram.su"
    : "https://api.dev.foxogram.su";

export interface AttachmentResponse {
    id: number;
    uploadUrl: string;
}

export const getAuthToken = (): string | null => localStorage.getItem("authToken");
const setAuthToken = (token: string) => {localStorage.setItem("authToken", token);};
export const removeAuthToken = (): void => {localStorage.removeItem("authToken");};

const rest = new REST({ baseURL: apiUrl });
const token = getAuthToken();
if (token) rest.token = token;

const foxogramAPI = new API(rest);

export const apiMethods = {
    login: async (email: string, password: string) => {
        const t = await foxogramAPI.auth.login({ email, password });
        setAuthToken(t.access_token);
        rest.token = t.access_token;
        return t;
    },
    register: async (username: string, email: string, password: string) => {
        const t = await foxogramAPI.auth.register({ username, email, password });
        setAuthToken(t.access_token);
        rest.token = t.access_token;
        return t;
    },
    resendEmailVerification: () => foxogramAPI.auth.resendEmail(),
    resetPassword: (email: string) => foxogramAPI.auth.resetPassword({ email }),
    confirmResetPassword: (email: string, code: string, new_password: string) => foxogramAPI.auth.resetPasswordConfirm({ email, code, new_password }),
    verifyEmail: (code: string) => foxogramAPI.auth.verifyEmail({ code }),
    getCurrentUser: async (): Promise<APIUser> => {
        const t = getAuthToken();
        if (!t) throw new Error("Authorization required");
        try {
            return await foxogramAPI.user.current();
        } catch (err: any) {
            if (err.status === 401) {
                removeAuthToken();
            }
            throw err;
        }
    },
    editUser: (body: { username?: string; email?: string }) => foxogramAPI.user.edit(body),
    deleteUser: async (body: { password: string }) => {await foxogramAPI.user.delete(body);removeAuthToken();
    },
    confirmDeleteUser: (body: { password: string; code: string }) => foxogramAPI.user.confirmDelete(body),
    userChannelsList: (): Promise<APIChannel[]> => foxogramAPI.user.channels(),

    createChannel: (body: { display_name: string; name: string; type: ChannelType; }) => foxogramAPI.channel.create(body),
    deleteChannel: (channelId: number) => foxogramAPI.channel.delete(channelId),
    editChannel: (channelId: number, body: { name?: string }) => foxogramAPI.channel.edit(channelId, body),
    getChannel: (channelId: number) => foxogramAPI.channel.get(channelId),
    joinChannel: (channelId: number) => foxogramAPI.channel.join(channelId),
    leaveChannel: (channelId: number) => foxogramAPI.channel.leave(channelId),
    getChannelMember: (channelId: number, memberKey: MemberKey) => foxogramAPI.channel.member(channelId, memberKey),
    listChannelMembers: (channelId: number) => foxogramAPI.channel.members(channelId),
    listMessages: (channelId: number, query?: RESTGetAPIMessageListQuery): Promise<APIMessage[]> => foxogramAPI.message.list(channelId, query),
    getMessage: (channelId: number, messageId: number) => foxogramAPI.message.get(channelId, messageId),

    createMessage: async (channelId: number, content: string, attachmentIds: number[] = []): Promise<APIMessage> => {
        const body: RESTPostAPIMessageBody = { content, attachments: attachmentIds };
        return foxogramAPI.message.create(channelId, body);
    },

    uploadFileToStorage: async (uploadUrl: string, file: File): Promise<void> => {
        const resp = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });
        if (!resp.ok) {
            throw new Error(resp.statusText);
        }
    },

    createMessageAttachments: async (channelId: number, files: File[]): Promise<AttachmentResponse[]> => {
        const body: RESTPutAPIMessageAttachmentsBody = await Promise.all(
            files.map(async (file) => {
                const thumbhash = await generateThumbHashFromFile(file);
                return {
                    filename: file.name,
                    content_type: file.type,
                    thumbhash,
                };
            }),
        );

        const res = await foxogramAPI.message.createAttachments(
            channelId,
            body,
        );

        return (res).map((r) => ({
            id: r.id,
            uploadUrl: r.url,
        }));
    },

    editMessage: (channelId: number, messageId: number, body: { content?: string; attachments?: File[] }): Promise<APIMessage> => {
        return foxogramAPI.message.edit(channelId, messageId, { content: body.content, attachments: body.attachments });},

    deleteMessage: (channelId: number, messageId: number) => foxogramAPI.message.delete(channelId, messageId),
};
