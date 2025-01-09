import { useState, useEffect, useCallback, useMemo } from "preact/hooks";
import { useLocation } from "preact-iso";
import "./style.css";
import Loading from "@components/LoadingApp/LoadingApp.tsx";
import Sidebar from "@components/chat/Sidebar/Sidebar.tsx";
import ChatWindow from "@components/chat/ChatWindow/ChatWindow.tsx";
import EmptyState from "@components/chat/EmptyState/EmptyState.tsx";
import { Chat } from "../../types/chatTypes.ts";
import { userChannelsList } from "@services/api/apiMethods.ts";
import { APIChannel } from "@foxogram/api-types";
import { getAuthToken } from "@services/api/apiMethods";

enum ChannelType {
	DM = 1,
	Group = 2,
	Channel = 3,
}

export function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [chats, setChats] = useState<Chat[]>([]);
	const location = useLocation();
	const currentUser = "user1";
	const token = getAuthToken();

	useEffect(() => {
		if (!token) {
			location.route("/auth/login");
		}
	}, [token, location]);

	const formatChannel = useCallback((channel: APIChannel) => {
		return {
			name: channel.name,
			displayName: channel.displayName || channel.name,
			avatar: channel.icon,
			isDM: channel.type === ChannelType.DM,
			isGroup: channel.type === ChannelType.Group,
			isChannel: channel.type === ChannelType.Channel,
			lastMessage: {
				sender: channel.lastMessage?.sender || "System",
				senderId: channel.lastMessage?.senderId || "system",
				text: channel.lastMessage?.text || "No messages yet",
				timestamp: channel.lastMessage?.timestamp || Date.now(),
			},
		};
	}, []);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const channels = await userChannelsList();
				if (!channels || channels.length === 0) {
					console.error("Failed to load channels or no channels found.");
					setIsLoading(false);
					return;
				}

				const formattedChannels = channels.map(formatChannel);
				setChats(formattedChannels);
			} catch (error) {
				console.error("Error fetching user data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [location, formatChannel]);

	const handleSelectChat = useCallback((chat: Chat) => {
		setSelectedChat(chat);
	}, []);

	const chatContent = useMemo(() => {
		if (selectedChat) {
			return <ChatWindow chat={selectedChat} />;
		} else {
			return <EmptyState chats={chats} onSelectChat={handleSelectChat} selectedChat={selectedChat} />;
		}
	}, [selectedChat, chats, handleSelectChat]);

	if (isLoading) {
		return <Loading onLoaded={() => setIsLoading(false)} />;
	}

	return (
		<div className="home-container">
			<Sidebar
				chats={chats}
				onSelectChat={handleSelectChat}
				currentUser={currentUser}
			/>
			<div className="chat-container">{chatContent}</div>
		</div>
	);
}
