import { observer } from "mobx-react";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import "./style.scss";

import Sidebar from "@components/LeftBar/Sidebar";
import ChatWindow from "@components/RightBar/ChatWindow";
import EmptyState from "@components/RightBar/EmptyState/EmptyState";
import Settings from "@components/Settings/Settings";
import SidebarFooter from "@components/LeftBar/SidebarFooter/SidebarFooter";

import appStore from "@store/app";
import { useAuthStore } from "@store/authenticationStore";

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
	const [activeTab, setActiveTab] = useState<"chats" | "settings" | "contacts">("chats");
	const [selectedSection, setSelectedSection] = useState("");
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");

	useEffect(() => {
		if (!isMobile && activeTab === "settings" && selectedSection === "") {
			setSelectedSection("profile");
		}
	}, [activeTab, isMobile, selectedSection]);

	const authorized = useAuthRedirect();

	if (authorized === null) return null;

	const getChannelIdFromHash = () => {
		const hash = window.location.hash;
		const match = hash.match(/#(\d+)/);
		return match ? Number(match[1]) : null;
	};

	useEffect(() => {
		const channelId = getChannelIdFromHash();

		if (channelId) {
			const channelExists = appStore.channels.some((c) => c.id === channelId);

			if (channelExists) {
				if (appStore.currentChannelId !== channelId) {
					void appStore.setCurrentChannel(channelId);
				}
			} else {
				const currentChannelId = appStore.currentChannelId;
				if (currentChannelId) {
					window.history.replaceState(
						null,
						"",
						`/channels/#${currentChannelId}`,
					);
				} else {
					window.location.href = "/channels";
				}
			}
		} else {
			void appStore.setCurrentChannel(null);
		}
	}, [appStore.channels.length]);

	useEffect(() => {
		const handleHashChange = () => {
			const channelId = getChannelIdFromHash();
			if (channelId && appStore.channels.some((c) => c.id === channelId)) {
				void appStore.setCurrentChannel(channelId);
			} else if (channelId) {
				const currentChannelId = appStore.currentChannelId;
				if (currentChannelId) {
					window.history.replaceState(
						null,
						"",
						`/channels/#${currentChannelId}`,
					);
				} else {
					window.location.href = "/channels";
				}
			} else {
				void appStore.setCurrentChannel(null);
			}
		};

		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, [appStore.channels]);

	const { channels, currentUserId, currentChannelId } = appStore;
	const currentUser = appStore.users.find((u) => u.id === currentUserId);
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

	if (isMobile) {
		const isSettingsActive = activeTab === "settings";
		return (
			<div className="home-container mobile">
				<div
					className={
						`sidebar-wrapper sidebarAnimatedSection slideLeft` +
						(activeTab === "chats" && mobileView === "list" ? " visible" : "")
					}
					style={{ zIndex: activeTab === "chats" && mobileView === "list" ? 11 : 10 }}
				>
					<Sidebar
						currentUser={currentUser}
						isMobile
						setChatTransition={() => {}}
						setMobileView={setMobileView}
						activeTab={activeTab}
						onTabChange={tab => {
							if (tab === "chats" || tab === "settings" || tab === "contacts") setActiveTab(tab);
						}}
						selectedSection={selectedSection}
						onSelectSection={setSelectedSection}
					/>
				</div>
				<div
					className={
						`settings sidebarAnimatedSection slideRight` +
						(activeTab === "settings" ? " visible" : "")
					}
					style={{ zIndex: activeTab === "settings" ? 11 : 10 }}
				>
					<Settings
						currentUser={currentUser}
						selectedSection={selectedSection}
						onSelectSection={setSelectedSection}
						isMobile={isMobile}
						onTabChange={tab => {
							if (tab === "chats" || tab === "settings" || tab === "contacts") setActiveTab(tab);
						}}
					/>
				</div>
				<div
					className={
						`chat-container sidebarAnimatedSection slideRight` +
						(mobileView === "chat" ? " visible" : "")
					}
					style={{ zIndex: mobileView === "chat" ? 11 : 10 }}
				>
					{selectedChat ? (
						<ChatWindow
							channel={selectedChat}
							currentUserId={currentUserId ?? -1}
							isMobile={true}
							onBack={() => {
								appStore.setCurrentChannel(null);
								setMobileView("list");
							}}
						/>
					) : (
						<EmptyState selectedChat={null} />
					)}
				</div>
				{(!isSettingsActive || selectedSection === "") && mobileView !== "chat" && (
					<SidebarFooter
						active={activeTab}
						onNav={setActiveTab}
						isMobile={true}
						className={isSettingsActive && selectedSection !== "" ? "footerHidden" : ""}
					/>
				)}
			</div>
		);
	}

	return (
		<div className="home-container">
			<Sidebar
				currentUser={currentUser}
				isMobile={false}
				activeTab={activeTab}
				onTabChange={tab => {
					if (tab === "chats" || tab === "settings" || tab === "contacts") setActiveTab(tab);
				}}
				selectedSection={selectedSection}
				onSelectSection={setSelectedSection}
			/>
			<div className="chat-container">
				{activeTab === "settings" ? (
					<Settings 
						currentUser={currentUser} 
						selectedSection={selectedSection}
						onSelectSection={setSelectedSection}
						isMobile={isMobile}
					/>
				) : selectedChat ? (
					<ChatWindow
						channel={selectedChat}
						currentUserId={currentUserId ?? -1}
						isMobile={false}
					/>
				) : (
					<EmptyState selectedChat={null} />
				)}
			</div>
		</div>
	);
};

export const Home = observer(HomeComponent);
