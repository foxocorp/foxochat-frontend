import { useEffect } from "preact/hooks";
import { apiMethods } from "@services/api/apiMethods.ts";
import { Logger } from "../utils/logger.ts";
import { APIChannel, APIUser } from "@foxogram/api-types";
import { Channel, User } from "@interfaces/chat.interface";

export function useFetchUserData(setChats: (chats: Channel[]) => void, setIsLoading: (isLoading: boolean) => void, isOffline: boolean) {
    const formatUser = (apiUser: APIUser): User => ({
        id: apiUser.id,
        channels: apiUser.channels ?? [],
        avatar: apiUser.avatar,
        display_name: apiUser.display_name,
        username: apiUser.username,
        email: apiUser.email,
        flags: apiUser.flags,
        type: apiUser.type,
        created_at: apiUser.created_at,
    }) as User;

    const formatChannel = (apiChannel: APIChannel): Channel => ({
        id: apiChannel.id,
        name: apiChannel.name,
        display_name: apiChannel.display_name,
        icon: apiChannel.icon,
        type: apiChannel.type,
        owner: formatUser(apiChannel.owner),
        created_at: apiChannel.created_at,
        lastMessage: apiChannel.last_message ?? null,
    });

    useEffect(() => {
        if (isOffline) return;

        const fetchUserData = async () => {
            try {
                const channels = await apiMethods.userChannelsList();
                const formattedChannels = channels.map(formatChannel);
                setChats(formattedChannels);
            } catch (error) {
                Logger.error(error instanceof Error ? error.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchUserData();
    }, [isOffline, setChats, setIsLoading]);
}