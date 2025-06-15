import { apiMethods, getAuthToken } from "@services/API/apiMethods";
import { Logger } from "@utils/logger";
import type { APIChannel } from "foxochat.js";
import { APIMessage } from "foxochat.js";
import { observable, runInAction } from "mobx";
import { AppStore } from "./appStore";
import { CachedChat } from "./metaCache";
import { createChannelFromAPI, transformToMessage } from "./transforms";

interface AuthError {
	response?: { status?: number };
	code?: string;
}

function isAuthError(err: unknown): err is AuthError {
	return (
		typeof err === "object" &&
		err !== null &&
		("response" in err || "code" in err)
	);
}

function handleAuthError(this: AppStore, error: unknown) {
	if (
		isAuthError(error) &&
		(error.response?.status === 401 || error.code === "UNAUTHORIZED")
	) {
		Logger.error(`Auth error: ${JSON.stringify(error)}`);
		this.clearAuthAndRedirect();
	} else {
		Logger.error(`API error: ${JSON.stringify(error)}`);
	}
}

function mapToCachedChat(channel: APIChannel): CachedChat {
	const transformed = createChannelFromAPI(channel);
	if (!transformed) {
		throw new Error("Failed to transform channel");
	}
	return transformed;
}

const messageSound = new Audio("/sounds/fchat_sfx.mp3");
messageSound.volume = 0.5;

export async function fetchCurrentUser(this: AppStore): Promise<void> {
	if (this.currentUserId || !getAuthToken()) {
		Logger.debug("Skipping getCurrentUser - already have userId or no token");
		return;
	}

	try {
		Logger.debug("Fetching current user...");
		const user = await apiMethods.getCurrentUser();
		runInAction(() => {
			this.setCurrentUser(user.id);
			this.connectionError = null;
			this.updateUsersFromServer([user]);
		});
	} catch (error) {
		handleAuthError.call(this, error);
	}
}

export async function fetchChannelsFromAPI(
	this: AppStore,
): Promise<CachedChat[]> {
	if (
		!getAuthToken() ||
		this.channels.length > 0 ||
		this.activeRequests.has("channels")
	) {
		return this.channels;
	}

	runInAction(() => {
		this.activeRequests.add("channels");
		this.isLoading = true;
	});

	try {
		const apiChannels: APIChannel[] = await apiMethods.userChannelsList();

		const transformedChannels = apiChannels
			.map((channel) => observable.object(createChannelFromAPI(channel)))
			.filter(Boolean) as CachedChat[];

		const cachedChannels = apiChannels.map(mapToCachedChat);

		runInAction(() => {
			this.channels = observable.array(cachedChannels);
		});

		await this.updateChatsFromServer(apiChannels);

		return transformedChannels;
	} catch (error) {
		handleAuthError.call(this, error);
		throw error;
	} finally {
		runInAction(() => {
			this.isLoading = false;
			this.activeRequests.delete("channels");
		});
	}
}

export async function sendMessage(
	this: AppStore,
	content: string,
	files: File[] = [],
): Promise<void> {
	if (!this.currentChannelId || !this.currentUserId) {
		Logger.warn("Cannot send message: no channel or user selected");
		return;
	}

	const channelId = this.currentChannelId;

	runInAction(() => {
		this.isSendingMessage = true;
	});

	try {
		let attachmentIds: number[] = [];
		if (files.length > 0) {
			const atts = await apiMethods.createMessageAttachments(channelId, files);
			await Promise.all(
				atts.map((att, idx) => {
					const file = files[idx];
					if (!file) return Promise.resolve();
					return apiMethods.uploadFileToStorage(att.uploadUrl, file);
				}),
			);
			attachmentIds = atts.map((att) => att.id);
		}

		const apiMsg = await apiMethods.createMessage(
			channelId,
			content,
			attachmentIds,
		);
		const message = transformToMessage(apiMsg);

		runInAction(() => {
			const messages =
				this.messagesByChannelId.get(channelId) ??
				observable.array<APIMessage>([]);
			messages.push(message);
			this.messagesByChannelId.set(channelId, messages);
			this.isSendingMessage = false;
		});
	} catch (error) {
		runInAction(() => {
			this.isSendingMessage = false;
			this.connectionError = "Failed to send message";
		});
		Logger.error(`Failed to send message: ${error}`);
	}
}

export async function retryMessage(
	this: AppStore,
	messageId: number,
): Promise<void> {
	const channelId = this.currentChannelId;
	if (channelId === null) return;

	const msgs = this.messagesByChannelId.get(channelId) ?? [];
	const msg = msgs.find((m) => m.id === messageId);
	if (!msg) return;

	const files = await Promise.all(
		msg.attachments.map(async (att) => {
			const url = `${config.cdnBaseUrl}${att.uuid}`;
			const response = await fetch(url);
			const blob = await response.blob();
			return new File([blob], att.filename || "file", {
				type: att.content_type,
			});
		}),
	);

	await this.sendMessage(msg.content, files);
	this.deleteMessage(messageId);
}

export async function fetchUsers(
	this: AppStore,
	userIds: number[],
): Promise<void> {
	if (!userIds.length || !this.currentChannelId) return;

	try {
		const users = await Promise.all(
			userIds.map((id) => apiMethods.getChannelMember(this.currentChannelId!, id)),
		);
		runInAction(() => {
			this.updateUsersFromServer(users.map(member => member.user));
		});
	} catch (error) {
		Logger.error(`Failed to fetch users: ${error}`);
	}
}

export async function initializeStore(this: AppStore): Promise<void> {
	try {
		await fetchCurrentUser.call(this);
		await fetchChannelsFromAPI.call(this);
	} catch (error) {
		Logger.error(`Failed to initialize store: ${error}`);
		runInAction(() => {
			this.connectionError = "Failed to initialize";
		});
	}
}
