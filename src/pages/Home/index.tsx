import { useEffect, useState, useCallback, useRef } from "preact/hooks";
import { useLocation } from "preact-iso";
import { observer } from "mobx-react";
import "./style.css";
import Loading from "@components/LoadingApp/LoadingApp.tsx";
import Sidebar from "@components/LeftBar/Sidebar.tsx";
import ChatWindow from "@components/RightBar/ChatWindow.tsx";
import EmptyState from "@components/RightBar/EmptyState/EmptyState.tsx";
import { apiMethods } from "@services/API/apiMethods.ts";
import { getAuthToken } from "@services/API/apiMethods";
import { chatStore } from "@store/chatStore.ts";
import { Channel } from "@interfaces/chat.interface.ts";
import { Logger } from "@utils/logger.ts";
import { initWebSocket } from "../../gateway/initWebSocket.ts";
import { APIError } from "@foxogram/rest";

export const Home = observer(() => {
	const location = useLocation();
	const token = getAuthToken();

	const [initialLoadDone, setInitialLoadDone] = useState(false);
	const wsClientRef = useRef<ReturnType<typeof initWebSocket> | null>(null);
	const isMounted = useRef(true);

	const { channels: chats, currentUserId, currentChannelId, isLoading } = chatStore;
	const selectedChat = chats.find(c => c.id === currentChannelId) ?? null;

	const handleUnauthorized = useCallback(() => {
		localStorage.removeItem("authToken");
		location.route("/auth/login");
	}, [location]);

	useEffect(() => {
		const fetchChannels = async () => {
			if (!chatStore.channels.length) {
				await chatStore.fetchChannelsFromAPI();
			}
		};
		void fetchChannels();
	}, []);

	useEffect(() => {
		return () => {
			chatStore.setCurrentChannel(null);
			wsClientRef.current?.close();
		};
	}, []);

	const setupWebSocket = useCallback((token: string) => {
		wsClientRef.current?.close();
		const client = initWebSocket(token, handleUnauthorized);
		client.connect();
		wsClientRef.current = client;
		return client;
	}, [handleUnauthorized]);

	const initApp = useCallback(async () => {
		if (!isMounted.current && !token) return;

		try {
			Logger.debug("Initializing application...");

			const user = await apiMethods.getCurrentUser();
			chatStore.setCurrentUser(user.id);

			await chatStore.fetchChannelsFromAPI();
			await setupWebSocket(token);

			if (isMounted.current) {
				setInitialLoadDone(true);
			}
		} catch (error: APIError) {
			Logger.debug(`Status code: ${error.status}`);

			if (error.status === 401) {
				handleUnauthorized();
				return;
			}
		}
	}, [token, handleUnauthorized, setupWebSocket]);

	useEffect(() => {
		isMounted.current = true;
		initApp();

		return () => {
			isMounted.current = false;
		};
	}, [initApp]);

	const handleSelectChat = useCallback((chat: Channel) => {
		chatStore.setCurrentChannel(chat.id);
	}, []);

	if (isLoading || !initialLoadDone) {
		return <Loading isLoading={true} onLoaded={() => {}} />;
	}

	return (
		<div className="home-container">
			<Sidebar
				chats={chats}
				onSelectChat={handleSelectChat}
				currentUser={currentUserId ?? -1}
			/>
			<div className="chat-container">
				{selectedChat ? (
					<ChatWindow
						channel={selectedChat}
						currentUserId={currentUserId ?? -1}
						key={selectedChat.id}
					/>
				) : (
					<EmptyState
						chats={chats}
						onSelectChat={handleSelectChat}
						selectedChat={null}
					/>
				)}
			</div>
		</div>
	);
});
