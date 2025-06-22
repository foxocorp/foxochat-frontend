import { observer } from "mobx-react";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import "./style.scss";

import Sidebar from "@components/LeftBar/Sidebar";
import ChatWindow from "@components/RightBar/ChatWindow";
import EmptyState from "@components/RightBar/EmptyState/EmptyState";

import appStore from "@store/app";
import { useAuthStore } from "@store/authenticationStore";
import { APIChannel } from "foxochat.js";
import { CachedChat } from "@store/app/metaCache";

function useAuthRedirect(redirectTo = "/auth/login") {
	const authStore = useAuthStore();
	const [authorized, setAuthorized] = useState<boolean | null>(null);

	useEffect(() => {
		if (!authStore.isAuthenticated) {
			window.location.href = redirectTo;
		} else {
			setAuthorized(true);
		}
	}, [authStore.isAuthenticated, redirectTo]);

	return authorized;
}

const HomeComponent = () => {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");
	const [chatTransition, setChatTransition] = useState("");

	const authorized = useAuthRedirect();

	if (authorized === null) return null;

	const { channels, currentUserId, currentChannelId } = appStore;
	const currentUser = appStore.users.find(u => u.id === currentUserId);
	if (!currentUser) return null;

	const selectedChat = useMemo(
		() => channels.find((c) => c.id === currentChannelId) ?? null,
		[channels, currentChannelId],
	);

	const debounce = <T extends unknown[]>(
		fn: (...args: T) => void,
		ms: number,
	) => {
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const debounced = (...args: T) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				fn(...args);
			}, ms);
		};
		debounced.cancel = () => {
			clearTimeout(timeoutId);
		};
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

	const handleSelectChat = useCallback(
		async (chat: APIChannel | CachedChat) => {
			if (chat.id === currentChannelId) return;
			
			if (isMobile) {
				setMobileView("chat");
				setChatTransition("slide-in");
			}
			await appStore.setCurrentChannel(chat.id);
		},
		[isMobile, currentChannelId],
	);

	const handleBackToList = useCallback(() => {
		setChatTransition("slide-out");
		requestAnimationFrame(() => {
			setTimeout(async () => {
				await appStore.setCurrentChannel(null);
				setMobileView("list");
				setChatTransition("");
			}, 300);
		});
	}, []);

	if (isMobile) {
		return (
			<div className="home-container mobile">
				<div className="sidebar-wrapper visible">
					<Sidebar
						chats={channels}
						onSelectChat={(chat) => void handleSelectChat(chat)}
						currentUser={currentUser}
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
				currentUser={currentUser}
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
						chats={channels as (APIChannel | CachedChat)[]}
						onSelectChat={(chat) => void handleSelectChat(chat)}
						selectedChat={null}
					/>
				)}
			</div>
		</div>
	);
};

export const Home = observer(HomeComponent);
