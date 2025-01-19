import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import "./style.css";
import Loading from "@components/LoadingApp/LoadingApp.tsx";
import Sidebar from "@components/Chat/Sidebar/Sidebar.tsx";
import ChatWindow from "@components/Chat/ChatWindow/ChatWindow.tsx";
import EmptyState from "@components/Chat/EmptyState/EmptyState.tsx";
import { Channel, User } from "@interfaces/chat.interface";
import { apiMethods, removeAuthToken } from "@services/api/apiMethods.ts";
import { getAuthToken } from "@services/api/apiMethods";
import { initWebSocket } from "../../gateway";
import { APIChannel, APIUser } from "@foxogram/api-types";
import { Logger } from "../../utils/logger.ts";

export function Home() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isWsLoading, setIsWsLoading] = useState<boolean>(true);
	const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
	const [selectedChat, setSelectedChat] = useState<Channel | null>(null);
	const [chats, setChats] = useState<Channel[]>([]);
	const location = useLocation();
	const token = getAuthToken();

	const wsClient = useMemo(() => initWebSocket(), []);

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
		const handleOnline = () => {
			setIsOffline(false);
			setIsLoading(true);
		};

		const handleOffline = () => {
			setIsOffline(true);
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	useEffect(() => {
		if (!token) { location.route("/auth/login"); return; }

		apiMethods.getCurrentUser().catch(() => {
			removeAuthToken();
			location.route("/auth/login");
		});
	}, [token, location]);


	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const channels: APIChannel[] = await apiMethods.userChannelsList();
				const formattedChannels = channels.map(formatChannel);
				setChats(formattedChannels);
			} catch (error) {
				Logger.error(error instanceof Error ? error.message : String(error));
			} finally {
				setIsLoading(false);
			}
		};

		if (!isOffline) {
			void fetchUserData();
		}
	}, [isOffline]);

	useEffect(() => {
		if (wsClient && !isOffline) {
			setIsWsLoading(false);
		}
	}, [wsClient, chats, isOffline]);

	const handleSelectChat = useCallback((chat: Channel) => {
		setSelectedChat(chat);
	}, []);

	const chatContent = useMemo(() => {
		if (wsClient) {
			return selectedChat
				? <ChatWindow channel={selectedChat} wsClient={wsClient} currentUserId={1} />
				: <EmptyState chats={chats} onSelectChat={handleSelectChat} selectedChat={selectedChat} />;
		}
		return <div>Error: WebSocket client not available.</div>;
	}, [selectedChat, chats, handleSelectChat, wsClient]);

	if (isOffline || isLoading || isWsLoading) {
		return <Loading onLoaded={() => { setIsLoading(false); }} isLoading={true} />;
	}

	return (
		<div className="home-container">
			<Sidebar
				chats={chats}
				onSelectChat={handleSelectChat}
				currentUser={1}
			/>
			<div className="chat-container">
				{chatContent}
			</div>
		</div>
	);
}