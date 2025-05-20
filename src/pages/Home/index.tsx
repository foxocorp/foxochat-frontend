import { useEffect, useState, useCallback, useMemo, useRef } from "preact/hooks";
import { useLocation } from "preact-iso";
import { observer } from "mobx-react";

import "./style.scss";

import Loading from "@components/LoadingApp/LoadingApp";
import Sidebar from "@components/LeftBar/Sidebar";
import ChatWindow from "@components/RightBar/ChatWindow";
import EmptyState from "@components/RightBar/EmptyState/EmptyState";

import { apiMethods, getAuthToken } from "@services/API/apiMethods";
import { APIChannel } from "@foxogram/api-types";
import chatStore from "@store/chat/index";
import { Logger } from "@utils/logger";

interface FetchError extends Error {
	status?: number;
	url?: string;
	retryAfter?: number;
}

const HomeComponent = () => {
	const location = useLocation();
	const token = getAuthToken();
	const [initialLoadDone, setInitialLoadDone] = useState(false);
	const isMounted = useRef(true);
	const abortController = useRef(new AbortController());
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");
	const [chatTransition, setChatTransition] = useState("");

	const { channels, currentUserId, currentChannelId, isLoading } = chatStore;
	const selectedChat = useMemo(
		() => channels.find((c) => c.id === currentChannelId) ?? null,
		[channels, currentChannelId],
	);

	const debounce = <T extends unknown[]>(fn: (...args: T) => void, ms: number) => {
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const debounced = (...args: T) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => { fn(...args); }, ms);
		};
		debounced.cancel = () => { clearTimeout(timeoutId); };
		return debounced;
	};

	const handleResize = useCallback(
		debounce(() => {
			const newIsMobile = window.innerWidth < 768;
			setIsMobile(newIsMobile);
			if (newIsMobile) setMobileView("list");
		}, 100),
		[],
	);

	useEffect(() => {
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			handleResize.cancel();
		};
	}, [handleResize]);

	const retryRequest = async <T,>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
		for (let i = 0; i < retries; i++) {
			try {
				return await fn();
			} catch (err: unknown) {
				if (err instanceof Error) {
					if (err.name === "AbortError") throw err;
					const e = err as FetchError;
					if (e.status === 429) {
						const retryAfter = e.retryAfter ?? 1000;
						Logger.warn(`Rate limit exceeded, retrying after ${retryAfter}ms`);
						await new Promise((resolve) => setTimeout(resolve, retryAfter));
						continue;
					}
				}
				if (i === retries - 1) throw err;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
		throw new Error("Retry limit reached");
	};

	const initApp = useCallback(async () => {
		if (!token) {
			Logger.warn("No auth token found, redirecting to login");
			location.route("/auth/login");
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 500));

		try {
			Logger.debug("Initializing application...");

			const user = await retryRequest(() => apiMethods.getCurrentUser());
			chatStore.setCurrentUser(user.id);

			const fetchedChannels = await retryRequest(() => chatStore.fetchChannelsFromAPI());
			chatStore.channels.replace(fetchedChannels);

			const channelIds = chatStore.channels.map((c) => c.id);
			if (new Set(channelIds).size !== channelIds.length) {
				Logger.error("Duplicate channel IDs detected!");
			}

			if (isMounted.current) {
				setInitialLoadDone(true);
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (err.name === "AbortError") {
					Logger.debug("Request aborted due to component unmount");
					return;
				}
				Logger.error(`App init failed: ${err.message}`);
			}
			if ((err as FetchError).status === 401) {
				Logger.warn("Unauthorized, redirecting to login");
				location.route("/auth/login");
			}
		}
	}, [token, location]);

	useEffect(() => {
		isMounted.current = true;
		void initApp();
		return () => {
			isMounted.current = false;
			abortController.current.abort();
			abortController.current = new AbortController();
		};
	}, [initApp]);

	const handleSelectChat = useCallback(
		async (chat: APIChannel) => {
			await chatStore.setCurrentChannel(chat.id);
			if (isMobile) {
				setMobileView("chat");
				setChatTransition("slide-in");
			}
		},
		[isMobile],
	);

	const handleBackToList = useCallback(() => {
		setChatTransition("slide-out");
		requestAnimationFrame(() => {
			setTimeout(async () => {
				await chatStore.setCurrentChannel(null);
				if (isMounted.current) {
					setMobileView("list");
					setChatTransition("");
				}
			}, 300);
		});
	}, []);

	if (isLoading || !initialLoadDone) {
		return <Loading isLoading={true} onLoaded={() => undefined} />;
	}

	if (isMobile) {
		return (
			<div className="home-container mobile">
				<div className="sidebar-wrapper visible">
					<Sidebar
						chats={channels}
						onSelectChat={(chat) => void handleSelectChat(chat)}
						currentUser={currentUserId ?? -1}
						isMobile
					/>
				</div>
				{mobileView === "chat" && selectedChat ? (
					<div className={`chat-container ${chatTransition} visible`}>
						<ChatWindow
							channel={selectedChat}
							currentUserId={currentUserId ?? -1}
							onBack={handleBackToList}
							isMobile
						/>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div className="home-container">
			<Sidebar
				chats={channels}
				onSelectChat={(chat) => void handleSelectChat(chat)}
				currentUser={currentUserId ?? -1}
				isMobile={false}
			/>
			<div className="chat-container">
				{selectedChat ? (
					<ChatWindow
						channel={selectedChat}
						currentUserId={currentUserId ?? -1}
						isMobile={false}
					/>
				) : (
					<EmptyState
						chats={channels}
						onSelectChat={(chat) => void handleSelectChat(chat)}
						selectedChat={null}
					/>
				)}
			</div>
		</div>
	);
};

export const Home = observer(HomeComponent);
