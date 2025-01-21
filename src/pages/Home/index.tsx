import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import "./style.css";
import Loading from "@components/LoadingApp/LoadingApp.tsx";
import Sidebar from "@components/LeftBar/Sidebar.tsx";
import ChatWindow from "@components/RightBar/ChatWindow.tsx";
import EmptyState from "@components/RightBar/EmptyState/EmptyState.tsx";
import { Channel } from "@interfaces/chat.interface";
import { apiMethods } from "@services/api/apiMethods.ts";
import { getAuthToken } from "@services/api/apiMethods";
import { initWebSocket } from "../../gateway";
import { useFetchUserData } from "@hooks/useFetchUserData.ts";

export function Home() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isWsLoading, setIsWsLoading] = useState<boolean>(true);
	const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
	const [selectedChat, setSelectedChat] = useState<Channel | null>(null);
	const [chats, setChats] = useState<Channel[]>([]);
	const location = useLocation();
	const token = getAuthToken();

	const wsClient = useMemo(() => initWebSocket(), []);

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
		if (!token) {
			location.route("/auth/login");
			return;
		}

		apiMethods.getCurrentUser().catch(() => {
			location.route("/auth/login");
		});
	}, [token, location]);

	useFetchUserData(setChats, setIsLoading, isOffline);

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