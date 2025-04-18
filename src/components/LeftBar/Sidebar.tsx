import { useState, useEffect, useRef } from "preact/hooks";
import { SidebarProps } from "@interfaces/interfaces";
import styles from "./Sidebar.module.css";
import SearchBar from "./SearchBar/SearchBar";
import ChatList from "@components/LeftBar/ChatList/ChatList";
import UserInfo from "./UserInfo/UserInfo";
import CreateButton from "./CreateButton/CreateButton";
import CreateChannelModal from "./CreateChannelModal/CreateChannelModal";

const MIN_SIDEBAR_WIDTH = 300;
const DEFAULT_DESKTOP_WIDTH = 460;

interface Props extends SidebarProps {
    isMobile?: boolean;
}

const Sidebar = ({ chats, onSelectChat, currentUser, isMobile }: Props) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState<number>(DEFAULT_DESKTOP_WIDTH);
    const [maxWidth, setMaxWidth] = useState<number>(
        Math.min(600, window.innerWidth * 0.8),
    );
    const isResizing = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(DEFAULT_DESKTOP_WIDTH);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateChannel = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (!isMobile) {
            const saved = localStorage.getItem("sidebarWidth");
            if (saved) {
                const p = parseInt(saved, 10);
                if (!isNaN(p)) {
                    setWidth(p);
                    startWidth.current = p;
                }
            }
        }
    }, [isMobile]);

    useEffect(() => {
        if (isMobile) {
            setWidth(window.innerWidth);
        } else {
            setWidth(
                parseInt(localStorage.getItem("sidebarWidth") ?? "", 10) ||
                DEFAULT_DESKTOP_WIDTH,
            );
        }
    }, [isMobile]);

    useEffect(() => {
        const onResize = () =>
        { setMaxWidth(Math.min(600, window.innerWidth * 0.8)); };
        window.addEventListener("resize", onResize);
        return () => { window.removeEventListener("resize", onResize); };
    }, []);

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
        let newW = startWidth.current + delta;
        newW = Math.max(MIN_SIDEBAR_WIDTH, Math.min(newW, maxWidth));
        setWidth(newW);
    };

    const handleDocumentMouseUp = () => {
        if (isResizing.current) {
            isResizing.current = false;
            localStorage.setItem("sidebarWidth", String(width));
            document.removeEventListener("mousemove", handleDocumentMouseMove);
            document.removeEventListener("mouseup", handleDocumentMouseUp);
        }
    };

    const sidebarStyle = isMobile
        ? { width: "100%" }
        : { width: `${width}px` };

    return (
        <div ref={sidebarRef} className={styles.sidebar} style={sidebarStyle}>
            <div className={styles["sidebar-header"]}>
                <div className={styles["header-controls"]}>
                    <div className={styles["search-bar-wrapper"]}>
                        <SearchBar />
                    </div>
                    <CreateButton onClick={handleCreateChannel} />
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
                    onMouseDown={handleMouseDown as any}
                />
            )}
            {isModalOpen && (
                <CreateChannelModal
                    onClose={handleModalClose}
                    onSelectChat={onSelectChat}
                />
            )}
        </div>
    );
};

export default Sidebar;
