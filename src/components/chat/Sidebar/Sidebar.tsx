import styles from "./Sidebar.module.css";
import SearchBar from "./SearchBar/SearchBar";
import UserInfo from "./UserInfo/UserInfo";
import ChatList from "../ChatList/ChatList";
import { Channel } from "@types/chatTypes.ts";

interface SidebarProps {
    chats: Channel[];
    onSelectChat: (chat: Channel) => void;
    currentUser: number;
}

const Sidebar = ({ chats, onSelectChat, currentUser }: SidebarProps) => {
    return (
        <div className={styles["sidebar"]}>
            <div className={styles["sidebar-header"]}>
                <SearchBar />
            </div>
            <div className={styles["sidebar-chats"]}>
                <ChatList chats={chats} onSelectChat={onSelectChat} currentUser={currentUser} />
            </div>
            <div className={styles["sidebar-footer"]}>
                <UserInfo username={currentUser.toString()} avatar="/favicon-96x96.png" status="Online" />
            </div>
        </div>
    );
};

export default Sidebar;