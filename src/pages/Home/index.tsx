import { useEffect, useState, useCallback, useMemo } from "preact/hooks";
import { observer } from "mobx-react";

import "./style.scss";

import Sidebar from "@components/LeftBar/Sidebar";
import ChatWindow from "@components/RightBar/ChatWindow";
import EmptyState from "@components/RightBar/EmptyState/EmptyState";

import { APIChannel } from "@foxogram/api-types";
import appStore from "@store/app";

function useAuthRedirect(redirectTo = "/auth/login") {
	const [authorized, setAuthorized] = useState<boolean | null>(null);

	useEffect(() => {
		function checkAuth() {
			const token = localStorage.getItem("token");
			if (!token) {
				window.location.href = redirectTo;
			} else {
				setAuthorized(true);
			}
		}
		checkAuth();
	}, [redirectTo]);

	return authorized;
}

const HomeComponent = () => {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");
	const [chatTransition, setChatTransition] = useState("");

	const authorized = useAuthRedirect();

	if (authorized === null) return null;

	const { channels, currentUserId, currentChannelId } = appStore;
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

	const handleSelectChat = useCallback(
		async (chat: APIChannel) => {
			await appStore.setCurrentChannel(chat.id);
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