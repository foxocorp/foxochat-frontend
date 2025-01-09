import { API } from "@foxogram/api";
import { REST } from "@foxogram/rest";
import { ChannelType } from "@foxogram/api-types";
const apiUrl = import.meta.env.PROD
    ? "https://api.foxogram.su"
    : 'https://api.dev.foxogram.su/';

export const getAuthToken = (): string | null => localStorage.getItem("authToken");
const setAuthToken = (token: string): void => localStorage.setItem("authToken", token);
const removeAuthToken = (): void => localStorage.removeItem("authToken");

const defaultOptions = {
    authPrefix: "Bearer",
    baseURL: apiUrl,
};

const rest = new REST(defaultOptions);
const token = getAuthToken();
if (token) {
    rest.setToken(token);
}

const api = new API(rest);

/**
 * Auth methods
 */
export const login = async (email: string, password: string) => {
    try {
        const token = await api.auth.login({ email, password });
        setAuthToken(token.accessToken);
        return token;
    } catch (error) {
        console.error("Error logging in:", error);
        return undefined;
    }
};

export const register = async (username: string, email: string, password: string) => {
    try {
        const token = await api.auth.register({ email, password, username });
        setAuthToken(token.accessToken);
        return token;
    } catch (error) {
        console.error("Error registering user:", error);
        return undefined;
    }
};

export const resendEmailVerification = async () => {
    try {
        const result = await api.auth.resendEmail();
        return result;
    } catch (error) {
        console.error("Error resending email verification:", error);
        return undefined;
    }
};

export const resetPassword = async (email: string) => {
    try {
        const result = await api.auth.resetPassword({ email });
        return result;
    } catch (error) {
        console.error("Error resetting password:", error);
        return undefined;
    }
};

export const confirmResetPassword = async (email: string, code: string, newPassword: string) => {
    try {
        const result = await api.auth.resetPasswordConfirm({ email, code, newPassword });
        return result;
    } catch (error) {
        console.error("Error confirming password reset:", error);
        return undefined;
    }
};

export const verifyEmail = async (code: string) => {
    try {
        const result = await api.auth.verifyEmail({ code });
        return result;
    } catch (error) {
        console.error("Error verifying email:", error);
        return undefined;
    }
};

/**
 * User methods
 */
export const getCurrentUser = async (): Promise<{ username: string; avatar: string } | undefined> => {
    try {
        const user = await api.user.current();
        return user;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return undefined;
    }
};

export const editUser = async (body: { name: string; email: string; }) => {
    try {
        const updatedUser = await api.user.edit(body);
        return updatedUser;
    } catch (error) {
        console.error("Error editing user:", error);
        return undefined;
    }
};

export const deleteUser = async (body: { password: string }) => {
    try {
        const result = await api.user.delete(body);
        removeAuthToken()
        return result;
    } catch (error) {
        console.error("Error deleting user:", error);
        return undefined;
    }
};

export const confirmDeleteUser = async (body: { password: string; code: string }) => {
    try {
        const result = await api.user.confirmDelete(body);
        return result;
    } catch (error) {
        console.error("Error confirming user deletion:", error);
        return undefined;
    }
};

export const userChannelsList = async () => {
    try {
        const result = await api.user.channels();
        return result;
    } catch (error) {
        console.error("Error getting channels list:", error);
        return undefined;
    }
};

/**
 * Channel methods
 */
export const createChannel = async (body: { displayName: string; name: string; type: ChannelType }) => {
    try {
        const newChannel = await api.channel.create(body);
        return newChannel;
    } catch (error) {
        console.error("Error creating channel:", error);
        return undefined;
    }
};

export const deleteChannel = async (channelName: string) => {
    try {
        const result = await api.channel.delete(channelName);
        return result;
    } catch (error) {
        console.error("Error deleting channel:", error);
        return undefined;
    }
};

export const editChannel = async (channelName: string, body: { name?: string }) => {
    try {
        const updatedChannel = await api.channel.edit(channelName, body);
        return updatedChannel;
    } catch (error) {
        console.error("Error editing channel:", error);
        return undefined;
    }
};

export const getChannel = async (channelName: string) => {
    try {
        const channel = await api.channel.get(channelName);
        return channel;
    } catch (error) {
        console.error("Error fetching channel:", error);
        return undefined;
    }
};

export const joinChannel = async (channelName: string) => {
    try {
        const member = await api.channel.join(channelName);
        return member;
    } catch (error) {
        console.error("Error joining channel:", error);
        return undefined;
    }
};

export const leaveChannel = async (channelName: string) => {
    try {
        const result = await api.channel.leave(channelName);
        return result;
    } catch (error) {
        console.error("Error leaving channel:", error);
        return undefined;
    }
};

export const getChannelMember = async (channelName: string, memberKey: string) => {
    try {
        const member = await api.channel.member(channelName, memberKey);
        return member;
    } catch (error) {
        console.error("Error fetching channel member:", error);
        return undefined;
    }
};

export const listChannelMembers = async (channelName: string) => {
    try {
        const members = await api.channel.members(channelName);
        return members;
    } catch (error) {
        console.error("Error fetching channel members:", error);
        return undefined;
    }
};

