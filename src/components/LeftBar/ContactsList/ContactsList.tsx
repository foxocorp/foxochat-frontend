import appStore from "@store/app";
import { ChannelType } from "foxochat.js";
import { observer } from "mobx-react";
import type { ContactsListProps } from "@interfaces/interfaces";
import ChatItem from "../ChatList/ChatItem/ChatItem";
import EmptyContacts from "./EmptyContacts";
import * as stylesSidebar from "../Sidebar.module.scss";

const ContactsListComponent = ({ chats, currentUser, onCreateChat }: ContactsListProps) => {
	const dmChannels = chats.filter((ch) => ch.type === ChannelType.DM);

	if (dmChannels.length === 0) {
		return <EmptyContacts onCreateChat={onCreateChat} />;
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
