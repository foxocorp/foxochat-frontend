import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import "./style.css";
import Loading from "@components/LoadingApp/LoadingApp.tsx";
import Sidebar from "@components/Chat/Sidebar/Sidebar.tsx";
import ChatWindow from "@components/Chat/ChatWindow/ChatWindow.tsx";
import EmptyState from "@components/Chat/EmptyState/EmptyState.tsx";
import { Channel, Message } from "@types/chatTypes.ts";
import { apiMethods } from "@services/api/apiMethods.ts";
import { getAuthToken } from "@services/api/apiMethods";
import { initWebSocket } from "../../gateway";
import { APIChannel, APIMessage, APIUser } from "@foxogram/api-types";

export function Home() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedChat, setSelectedChat] = useState<Channel | null>(null);
	const [chats, setChats] = useState<Channel[]>([]);
	const location = useLocation();
	const token = getAuthToken();

	const wsClient = useMemo(() => initWebSocket(), []);

	useEffect(() => {
		const checkUser = async () => {
			if (!token || !(await apiMethods.getCurrentUser())) {
				location.route("/auth/login");
			}
		};
		checkUser();
	}, [token, location]);

	const formatMessage = useCallback((message: APIMessage, user: APIUser): Message => ({
		id: message.id,
		content: message.content,
		author: {
			member: '',
			id: message.author.user.id,
			user: {
				user: user,
				channels: user.channels || [],
				id: user.id,
				avatar: user.avatar,
				display_name: user.display_name,
				username: user.username,
				flags: user.flags,
				type: user.type,
				created_at: user.created_at,
			},
			permissions: 0,
			joined_at: 0,
		},
		channel: message.channel.id,
		attachments: message.attachments,
		created_at: message.created_at,
	}), []);

	const formatChannel = useCallback((channel: APIChannel): Channel => ({
		id: channel.id,
		display_name: channel.display_name,
		name: channel.name,
		icon: channel.icon || null,
		type: channel.type,
		owner: {
			user: channel.owner,
			channels: channel.owner.channels || [],
			id: channel.owner.id,
			avatar: channel.owner.avatar,
			display_name: channel.owner.display_name,
			username: channel.owner.username,
			flags: channel.owner.flags,
			type: channel.owner.type,
			created_at: channel.owner.created_at,
		},
		created_at: channel.created_at,
		lastMessage: channel.last_message
			? formatMessage(channel.last_message, channel.owner)
			: null,
	}), [formatMessage]);

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

	const handleSelectChat = useCallback((chat: Channel) => setSelectedChat(chat), []);

	const chatContent = useMemo(() => {
		if (wsClient) {
			return selectedChat
				? <ChatWindow channel={selectedChat} wsClient={wsClient} />
				: <EmptyState chats={chats} onSelectChat={handleSelectChat} selectedChat={selectedChat} />;
		} else {
			return <div>Error: WebSocket client not available.</div>;
		}
	}, [selectedChat, chats, handleSelectChat, wsClient]);

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
			<div className="chat-container">
				{chatContent}
			</div>
		</div>
	);
}
