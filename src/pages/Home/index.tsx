import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import "./style.css";
import Loading from "@components/LoadingApp/LoadingApp.tsx";
import Sidebar from "@components/Chat/Sidebar/Sidebar.tsx";
import ChatWindow from "@components/Chat/ChatWindow/ChatWindow.tsx";
import EmptyState from "@components/Chat/EmptyState/EmptyState.tsx";
import { Chat } from "../../types/chatTypes.ts";
import { apiMethods } from "@services/api/apiMethods.ts";
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
	const token = getAuthToken();

	useEffect(() => {
		const checkUser = async () => {
			if (!token || !(await apiMethods.getCurrentUser())) {
				location.route("/auth/login");
			}
		};
		checkUser();
	}, [token, location]);

	const formatChannel = useCallback((channel: APIChannel) => ({
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
	}), []);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const channels = await apiMethods.userChannelsList();
				if (channels?.length) {
					setChats(channels.map(formatChannel));
				} else {
					console.error("Failed to load channels or no channels found.");
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [formatChannel]);

	const handleSelectChat = useCallback((chat: Chat) => setSelectedChat(chat), []);

	const chatContent = useMemo(() => selectedChat
			? <ChatWindow chat={selectedChat} />
			: <EmptyState chats={chats} onSelectChat={handleSelectChat} selectedChat={selectedChat} />,
		[selectedChat, chats, handleSelectChat]);

	if (isLoading) {
		return <Loading onLoaded={() => setIsLoading(false)} />;
	}

	return (
		<div className="home-container">
			<Sidebar
				chats={chats}
				onSelectChat={handleSelectChat}
				currentUser="user1"
			/>
			<div className="chat-container">{chatContent}</div>
		</div>
	);
}