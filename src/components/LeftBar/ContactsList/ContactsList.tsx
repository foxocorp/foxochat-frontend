import appStore from "@store/app";
import type { APIChannel, APIUser } from "foxochat.js";
import { ChannelType } from "foxochat.js";
import { observer } from "mobx-react";
import ChatItem from "../ChatList/ChatItem/ChatItem";
import * as stylesSidebar from "../Sidebar.module.scss";

interface ContactsListProps {
	chats: APIChannel[];
	currentUser: APIUser;
}

const ContactsListComponent = ({ chats, currentUser }: ContactsListProps) => {
	const dmChannels = chats.filter((ch) => ch.type === ChannelType.DM);

	if (dmChannels.length === 0) {
		return <div style={{ padding: 24, color: "#888" }}>No contacts yet</div>;
	}

	return (
		<div className={stylesSidebar.chatList}>
			{dmChannels.map((chat) => (
				<ChatItem
					key={chat.id}
					chat={chat}
					isActive={chat.id === appStore.currentChannelId}
					currentUser={currentUser?.id ?? null}
					onOpenChat={() => {
						void appStore.setCurrentChannel(chat.id);
					}}
				/>
			))}
		</div>
	);
};

export default observer(ContactsListComponent);
