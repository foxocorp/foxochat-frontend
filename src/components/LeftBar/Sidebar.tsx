import { useState, useEffect, useRef } from "preact/hooks";
import { SidebarProps } from "@interfaces/interfaces";
import styles from "./Sidebar.module.css";
import SearchBar from "./SearchBar/SearchBar";
import ChatList from "@components/LeftBar/ChatList/ChatList";
import UserInfo from "./UserInfo/UserInfo";
import CreateButton from "./CreateButton/CreateButton";
import CreateChannelModal from "./CreateChannelModal/CreateChannelModal";
import CreateDropdown from "./CreateDropdown/CreateDropdown";
import { apiMethods } from "@services/API/apiMethods";
import { chatStore } from "@store/chat/chatStore";
import { ChannelType } from "@foxogram/api-types";

const MIN_SIDEBAR_WIDTH = 300;
const DEFAULT_DESKTOP_WIDTH = 460;

interface Props extends SidebarProps {
    isMobile?: boolean;
    setMobileView?: (view: "list" | "chat") => void;
    setChatTransition?: (transition: string) => void;
}

const Sidebar = ({
                     chats,
                     onSelectChat,
                     currentUser,
                     isMobile = false,
                     setMobileView = () => {},
                     setChatTransition = () => {},
                 }: Props) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState<"group" | "channel" | null>(null);
    const [width, setWidth] = useState(DEFAULT_DESKTOP_WIDTH);
    const [maxWidth, setMaxWidth] = useState(Math.min(600, window.innerWidth * 0.8));
    const isResizing = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(DEFAULT_DESKTOP_WIDTH);

    const handleCreate = async (data: {
        name: string;
        displayName: string;
        channelType: ChannelType;
        members?: string[];
    }) => {
        try {
            const response = await apiMethods.createChannel({
                name: data.name,
                display_name: data.displayName,
                type: data.channelType,
                members: data.members ?? [],
            });

            chatStore.addNewChannel(response);
            await chatStore.setCurrentChannel(response.id);

            if (isMobile) {
                setMobileView("chat");
                setChatTransition("slide-in");
            }
        } catch (error) {
            console.error("Creation error:", error);
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (isMobile) return;
        e.preventDefault();
        isResizing.current = true;
        startX.current = e.clientX;
        startWidth.current = width;
        document.addEventListener("mousemove", handleDocumentMouseMove);
        document.addEventListener("mouseup", handleDocumentMouseUp);
    };

    const handleDocumentMouseMove = (e: MouseEvent) => {
        if (!isResizing.current || isMobile) return;
        const delta = e.clientX - startX.current;
        const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(startWidth.current + delta, maxWidth));
        setWidth(newWidth);
    };

    const handleDocumentMouseUp = () => {
        if (isResizing.current) {
            isResizing.current = false;
            localStorage.setItem("sidebarWidth", String(width));
            document.removeEventListener("mousemove", handleDocumentMouseMove);
            document.removeEventListener("mouseup", handleDocumentMouseUp);
        }
    };

    useEffect(() => {
        if (isMobile) {
            setWidth(window.innerWidth);
        } else {
            const savedWidth = parseInt(localStorage.getItem("sidebarWidth") ?? "", 10);
            setWidth(isNaN(savedWidth) ? DEFAULT_DESKTOP_WIDTH : savedWidth);
        }
    }, [isMobile]);

    useEffect(() => {
        const handleResize = () => { setMaxWidth(Math.min(600, window.innerWidth * 0.8)); };
        window.addEventListener("resize", handleResize);
        return () => { window.removeEventListener("resize", handleResize); };
    }, []);

    return (
        <div
            ref={sidebarRef}
            className={styles.sidebar}
            style={isMobile ? { width: "100%" } : { width: `${width}px` }}
        >
            <div className={styles["sidebar-header"]}>
                <div className={styles["header-controls"]}>
                    <SearchBar
                        onJoinChannel={ async (channelId: number | null ) => {
                            await chatStore.setCurrentChannel(channelId);
                            if (isMobile) {
                                setMobileView("chat");
                            }
                        }}
                    />
                    <div className={styles["create-wrapper"]}>
                        <CreateButton onClick={() => { setShowCreateDropdown(!showCreateDropdown); }} />
                        {showCreateDropdown && (
                            <CreateDropdown
                                onSelect={(type) => {
                                    setShowCreateDropdown(false);
                                    setShowCreateModal(type);
                                }}
                                onClose={() => { setShowCreateDropdown(false); }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles["sidebar-chats"]}>
                <ChatList
                    chats={chats}
                    onSelectChat={onSelectChat}
                    currentUser={currentUser}
                />
            </div>

            <div className={styles["sidebar-footer"]}>
                <UserInfo
                    username={currentUser.toString()}
                    avatar="/favicon-96x96.png"
                    status="Online"
                />
            </div>

            {!isMobile && (
                <div
                    className={styles.resizer}
                    onMouseDown={handleMouseDown}
                />
            )}

            {showCreateModal && (
                <CreateChannelModal
                    type={showCreateModal}
                    onClose={() => { setShowCreateModal(null); }}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
};

export default Sidebar;