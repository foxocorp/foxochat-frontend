import ChatList from "@components/LeftBar/ChatList/ChatList";
import CreateChannelModal from "@components/Modal/CreateChannelModal/CreateChannelModal";
import * as modalStyles from "@components/Modal/CreateChannelModal/CreateChannelModal.module.scss";
import { SidebarProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import appStore from "@store/app";
import { ChannelType } from "foxochat.js";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "preact/hooks";
import CreateButton from "./CreateButton/CreateButton";
import CreateDropdown from "./CreateDropdown/CreateDropdown";
import SearchBar from "./SearchBar/SearchBar";
import * as styles from "./Sidebar.module.scss";
import UserInfo from "./UserInfo/UserInfo";

const MIN_SIDEBAR_WIDTH = 310;
const DEFAULT_DESKTOP_WIDTH = 420;
const MAX_SIDEBAR_WIDTH = 420;
const COLLAPSED_WIDTH = 100;
const COLLAPSE_THRESHOLD = MIN_SIDEBAR_WIDTH * 0.9;
const STORAGE_COLLAPSED_VALUE = 0;

const SidebarComponent = ({
	onSelectChat,
	currentUser,
	isMobile = false,
	setMobileView = () => undefined,
	setChatTransition = () => undefined,
}: SidebarProps) => {
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [showCreateDropdown, setShowCreateDropdown] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState<
		"group" | "channel" | null
	>(null);
	const initialMaxWidth = Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth * 0.8);
	const currentWidthRef = useRef<number>(0);
	const [nameError, setNameError] = useState<boolean>(false);
	const [nameErrorMessage, setNameErrorMessage] = useState<string>(
		"— Name is already taken",
	);

	const [width, setWidth] = useState(() => {
		if (isMobile) {
			const mobileWidth = window.innerWidth;
			localStorage.setItem("sidebarWidth", String(mobileWidth));
			currentWidthRef.current = mobileWidth;
			return mobileWidth;
		}
		const savedWidth = parseInt(localStorage.getItem("sidebarWidth") ?? "", 10);
		let initialWidth: number;
		if (isNaN(savedWidth)) {
			initialWidth = DEFAULT_DESKTOP_WIDTH;
		} else if (savedWidth === STORAGE_COLLAPSED_VALUE) {
			initialWidth = COLLAPSED_WIDTH;
		} else {
			initialWidth = Math.max(
				MIN_SIDEBAR_WIDTH,
				Math.min(savedWidth, initialMaxWidth),
			);
		}
		localStorage.setItem(
			"sidebarWidth",
			String(
				savedWidth === STORAGE_COLLAPSED_VALUE
					? STORAGE_COLLAPSED_VALUE
					: initialWidth,
			),
		);
		currentWidthRef.current = initialWidth;
		return initialWidth;
	});
	const [maxWidth, setMaxWidth] = useState(initialMaxWidth);

	const isResizing = useRef(false);
	const startX = useRef(0);
	const startWidthRef = useRef(width);
	const channels = appStore.channels;

	const renderError = (_field: "name", error: boolean, message: string) => {
		if (!error) return null;

		return <span className={modalStyles.inputError}>{message}</span>;
	};

	const resetErrors = () => {
		setNameError(false);
		setNameErrorMessage("— Name is already taken");
	};

	const handleCreate = async (data: {
		name: string;
		displayName: string;
		channelType: ChannelType;
		members?: string[];
		public?: boolean;
	}): Promise<boolean> => {
		setNameError(false);
		setNameErrorMessage("— Name is already taken");

		const name = data.name.trim();
		if (!name) {
			setNameError(true);
			setNameErrorMessage("— Name cannot be empty");
			return false;
		}

		try {
			const response = await apiMethods.createChannel({
				name: data.name,
				display_name: data.displayName,
				type: data.channelType,
				public: data.public ?? false,
			});

			appStore.addNewChannel(response);
			await appStore.setCurrentChannel(response.id);

			if (isMobile) {
				setMobileView("chat");
				setChatTransition("slide-in");
			}

			return true;
		} catch (err) {
			setNameError(true);
			const message =
				(err as { response?: { message?: string } })?.response?.message ||
				(err as Error).message ||
				"— Creation failed";
			setNameErrorMessage(message);
			return false;
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (isMobile) return;
		e.preventDefault();
		isResizing.current = true;
		startX.current = e.clientX;
		startWidthRef.current = currentWidthRef.current;
		document.addEventListener("mousemove", handleDocumentMouseMove);
		document.addEventListener("mouseup", handleDocumentMouseUp);
	};

	const handleDocumentMouseMove = (e: MouseEvent) => {
		if (!isResizing.current || isMobile) return;
		const delta = e.clientX - startX.current;
		let newWidth = startWidthRef.current + delta;
		if (
			startWidthRef.current === COLLAPSED_WIDTH &&
			newWidth > COLLAPSED_WIDTH
		) {
			newWidth = Math.max(MIN_SIDEBAR_WIDTH, newWidth);
		}
		newWidth = Math.max(COLLAPSE_THRESHOLD, Math.min(newWidth, maxWidth));
		currentWidthRef.current = newWidth;
		setWidth(newWidth);
		localStorage.setItem("sidebarWidth", String(newWidth));
	};

	const handleDocumentMouseUp = () => {
		if (!isResizing.current) return;
		isResizing.current = false;
		let finalWidth = currentWidthRef.current;
		let storageWidth = finalWidth;
		if (finalWidth >= COLLAPSE_THRESHOLD && finalWidth < MIN_SIDEBAR_WIDTH) {
			finalWidth = COLLAPSED_WIDTH;
			storageWidth = STORAGE_COLLAPSED_VALUE;
		}
		currentWidthRef.current = finalWidth;
		setWidth(finalWidth);
		localStorage.setItem("sidebarWidth", String(storageWidth));
		document.removeEventListener("mousemove", handleDocumentMouseMove);
		document.removeEventListener("mouseup", handleDocumentMouseUp);
	};

	useEffect(() => {
		const handleResize = () => {
			const newMaxWidth = Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth * 0.5);
			setMaxWidth(newMaxWidth);
			if (
				currentWidthRef.current > newMaxWidth &&
				currentWidthRef.current !== COLLAPSED_WIDTH
			) {
				const adjustedWidth = newMaxWidth;
				currentWidthRef.current = adjustedWidth;
				setWidth(adjustedWidth);
				localStorage.setItem("sidebarWidth", String(adjustedWidth));
			}
		};
		if (isMobile) {
			const mobileWidth = window.innerWidth;
			currentWidthRef.current = mobileWidth;
			setWidth(mobileWidth);
			localStorage.setItem("sidebarWidth", String(mobileWidth));
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [isMobile]);

	const isCollapsed =
		parseInt(localStorage.getItem("sidebarWidth") ?? "", 10) ===
		STORAGE_COLLAPSED_VALUE;

	return (
		<div
			ref={sidebarRef}
			className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
			style={isMobile ? { width: "100%" } : { width: `${width}px` }}
		>
			{!isCollapsed && (
				<div className={styles.sidebarHeader}>
					<div className={styles.headerControls}>
						<SearchBar
							onJoinChannel={async (channelId: number | null) => {
								await appStore.setCurrentChannel(channelId);
								if (isMobile) {
									setMobileView("chat");
								}
							}}
						/>
						<div className={styles.createWrapper}>
							<CreateButton
								onClick={() => setShowCreateDropdown(!showCreateDropdown)}
							/>
							{showCreateDropdown && (
								<CreateDropdown
									onSelect={(type) => {
										setShowCreateDropdown(false);
										setShowCreateModal(type);
									}}
									onClose={() => setShowCreateDropdown(false)}
								/>
							)}
						</div>
					</div>
				</div>
			)}
			<div className={styles.sidebarChats}>
				<ChatList
					chats={channels}
					onSelectChat={onSelectChat}
					currentUser={currentUser}
					isCollapsed={isCollapsed}
				/>
			</div>
			{!isCollapsed && (
				<div className={styles.sidebarFooter}>
					<UserInfo user={currentUser} status="Online" />
				</div>
			)}
			{!isMobile && (
				<div className={styles.resizer} onMouseDown={handleMouseDown} />
			)}
			{showCreateModal && (
				<CreateChannelModal
					type={showCreateModal}
					onClose={() => setShowCreateModal(null)}
					onCreate={handleCreate}
					renderError={renderError}
					nameError={nameError}
					nameErrorMessage={nameErrorMessage}
					resetErrors={resetErrors}
				/>
			)}
		</div>
	);
};

export default observer(SidebarComponent);
