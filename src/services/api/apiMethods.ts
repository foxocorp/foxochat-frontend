import { API, UserAPI, MessageAPI, ChannelAPI } from "@foxogram/api";
import { REST } from "@foxogram/rest";
import {
    RESTDeleteAPIUserBody,
    RESTPatchAPIUserBody,
    RESTPostAPIAuthLoginBody,
    RESTPostAPIAuthRegisterBody,
    RESTPostAPIUserDeleteConfirmBody,
    RESTPostAPIMessageBody,
    RESTPatchAPIMessageBody,
    RESTPostAPIChannelBody,
    RESTPatchAPIChannelBody,
} from "@foxogram/api-types";

const getAuthToken = () => localStorage.getItem("authToken");
const setAuthToken = (token: string) => localStorage.setItem("authToken", token);
const removeAuthToken = () => localStorage.removeItem("authToken");

const rest = new REST();
rest.setToken(getAuthToken() || "");
export const api = new API(rest);

const apiRequest = async <T>(method: () => Promise<T>, errorMessage: string): Promise<T> => {
    try {
        return await method();
    } catch (error) {
        const errorMessageToLog = error instanceof Error ? error.message : "Unknown error";
        console.error(`[ERROR] ${errorMessage}`);
        throw new Error(errorMessageToLog);
    }
};

export const apiMethods = {

    async fetchUserChannels() {
        return apiRequest(async () => {
            const token = getAuthToken();
            const response = await fetch('https://api.foxogram.su/users/@me/channels', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user channels');
            }

            return await response.json();
        }, "Fetching user channels");
    },

    async register(body: RESTPostAPIAuthRegisterBody) {
        return apiRequest(async () => {
            const data = await api.auth.register(body);
            if (data.accessToken) {
                setAuthToken(data.accessToken);
            }
            return data;
        }, "Registration");
    },

    async login(body: RESTPostAPIAuthLoginBody) {
        return apiRequest(async () => {
            const data = await api.auth.login(body);
            if (data.accessToken) {
                setAuthToken(data.accessToken);
            }
            return data;
        }, "Login");
    },

    async verifyEmail(code: string) {
        return apiRequest(async () => {
            return await api.auth.verifyEmail({ code });
        }, "Email verification");
    },

    async resendEmail() {
        return apiRequest(async () => {
            return await api.auth.resendEmail();
        }, "Resend email");
    },

    async resetPassword(email: string) {
        return apiRequest(async () => {
            return await api.auth.resetPassword({ email });
        }, "Reset password");
    },

    async resetPasswordConfirm(email: string, code: string, newPassword: string) {
        return apiRequest(async () => {
            return await api.auth.resetPasswordConfirm({ email, code, newPassword });
        }, "Reset password confirmation");
    },

    async fetchCurrentUser() {
        return apiRequest(async () => {
            const userApiInstance = new UserAPI(rest);
            return await userApiInstance.current();
        }, "Fetching current user");
    },

    async updateUserProfile(body: RESTPatchAPIUserBody) {
        return apiRequest(async () => {
            const userApiInstance = new UserAPI(rest);
            return await userApiInstance.edit(body);
        }, "Updating user profile");
    },

    async deleteUserAccount(body: RESTDeleteAPIUserBody) {
        return apiRequest(async () => {
            const userApiInstance = new UserAPI(rest);
            return await userApiInstance.delete(body);
        }, "Deleting user account");
    },

    async confirmDeleteUserAccount(body: RESTPostAPIUserDeleteConfirmBody) {
        return apiRequest(async () => {
            const userApiInstance = new UserAPI(rest);
            return await userApiInstance.confirmDelete(body);
        }, "Confirming user account deletion");
    },

    async createMessage(channelId: string, body: RESTPostAPIMessageBody) {
        return apiRequest(async () => {
            const messageApiInstance = new MessageAPI(rest);
            return await messageApiInstance.create(channelId, body);
        }, "Creating message");
    },

    async deleteMessage(channelId: string, messageId: string) {
        return apiRequest(async () => {
            const messageApiInstance = new MessageAPI(rest);
            return await messageApiInstance.delete(channelId, Number(messageId));
        }, "Deleting message");
    },

    async editMessage(channelId: string, messageId: string, body: RESTPatchAPIMessageBody) {
        return apiRequest(async () => {
            const messageApiInstance = new MessageAPI(rest);
            return await messageApiInstance.edit(channelId, Number(messageId), body);
        }, "Editing message");
    },

    async getMessage(channelId: string, messageId: string) {
        return apiRequest(async () => {
            const messageApiInstance = new MessageAPI(rest);
            return await messageApiInstance.get(channelId, Number(messageId));
        }, "Fetching message");
    },

    async listMessages(channelId: string) {
        return apiRequest(async () => {
            const messageApiInstance = new MessageAPI(rest);
            return await messageApiInstance.list(channelId);
        }, "Listing messages");
    },

    async createChannel(channelName: string, body: RESTPostAPIChannelBody) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.create(channelName, body);
        }, "Creating channel");
    },

    async deleteChannel(channelId: string) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.delete(channelId);
        }, "Deleting channel");
    },

    async editChannel(channelId: string, body: RESTPatchAPIChannelBody) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.edit(channelId, body);
        }, "Editing channel");
    },

    async getChannel(channelId: string) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.get(channelId);
        }, "Fetching channel");
    },

    async joinChannel(channelId: string) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.join(channelId);
        }, "Joining channel");
    },

    async leaveChannel(channelId: string) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.leave(channelId);
        }, "Leaving channel");
    },

    async getChannelMember(channelId: string, memberKey: string) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.member(channelId, memberKey);
        }, "Getting channel member");
    },

    async listChannelMembers(channelId: string) {
        return apiRequest(async () => {
            const channelApiInstance = new ChannelAPI(rest);
            return await channelApiInstance.members(channelId);
        }, "Listing channel members");
    },
};

export const authUtils = {
    getAuthToken,
    setAuthToken,
    removeAuthToken,
};
