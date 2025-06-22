import ChannelIcon from "@/assets/icons/left-bar/chat-list/channel.svg";
import GroupIcon from "@/assets/icons/left-bar/chat-list/group.svg";
import EditIcon from "@/assets/icons/right-bar/chat/chat-overview/edit.svg";
import MarkAsReadIcon from "@/assets/icons/right-bar/chat/chat-overview/mark-as-read.svg";
import MuteIcon from "@/assets/icons/right-bar/chat/chat-overview/mute.svg";
import PinIcon from "@/assets/icons/right-bar/chat/chat-overview/pin.svg";
import PreviewIcon from "@/assets/icons/right-bar/chat/chat-overview/preview.svg";
import TrashIcon from "@/assets/icons/right-bar/chat/chat-overview/trash.svg";
import ContextMenu from "@components/Base/ContextMenu/ContextMenu";
import { useContextMenu } from "@components/Base/ContextMenu/useContextMenu";
import { ExtendedChatItemProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import { renderEmojisToJSX } from "@utils/emoji";
import { ChannelType } from "foxochat.js";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import React from "preact/compat";
import { ChatAvatar } from "./ChatAvatar";
import * as styles from "./ChatItem.module.scss";

const ChatItemComponent = ({
                               chat,
                               onSelectChat,
                               isActive,
                               isCollapsed = false,
                               currentUser,
                           }: ExtendedChatItemProps) => {
    const lastMessage = chat.last_message;
    const rawChat = toJS(chat);
    const nameToDisplay = chat.display_name || chat.name;

    const isCurrentUserAuthor = lastMessage?.author?.user?.id === currentUser;

    const authorName = isCurrentUserAuthor ? (
        <span className={styles.chatMessageAuthor}>You:</span>
    ) : (
        <span className={styles.chatMessageAuthor}>
			{lastMessage?.author?.user?.username || "Unknown"}:
		</span>
    );

    const lastMessageContent = lastMessage ? (
        <>
            {authorName} {lastMessage.content.substring(0, 30)}
            {lastMessage.content.length > 30 ? "..." : ""}
        </>
    ) : (
        "No messages"
    );

    const getIcon = () => {
        switch (rawChat.type) {
            case ChannelType.Group:
                return (
                    <img
                        src={GroupIcon}
                        alt="Group icon"
                        className={styles.channelTypeIcon}
                    />
                );
            case ChannelType.Channel:
                return (
                    <img
                        src={ChannelIcon}
                        alt="Channel icon"
                        className={styles.channelTypeIcon}
                    />
                );
            default:
                return null;
        }
    };

    const contextMenu = useContextMenu();

    const isOwner = chat.owner?.id === currentUser;

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const items = [
            {
                icon: <img src={PinIcon} alt="Pin"/>,
                label: "Pin",
                onClick: () => {
                    /* TODO: pin logic */
                },
            },
            ...(isOwner
                ? [
                    {
                        icon: <img src={EditIcon} alt="Edit"/>,
                        label: "Edit",
                        onClick: () => {
                            /* TODO: edit logic */
                        },
                    },
                ]
                : []),
            { divider: true },
            {
                icon: <img src={MuteIcon} alt="Mute"/>,
                label: "Mute",
                onClick: () => {
                    /* TODO: mute logic */
                },
            },
            {
                icon: <img src={MarkAsReadIcon} alt="Mark as read"/>,
                label: "Mark as read",
                onClick: () => {
                    /* TODO: mark as read logic */
                },
            },
            {
                icon: <img src={PreviewIcon} alt="Preview"/>,
                label: "Preview",
                onClick: () => {
                    /* TODO: preview logic */
                },
            },
            { divider: true },
            isOwner
                ? {
                    icon: <img src={TrashIcon} alt="Delete"/>,
                    label: "Delete",
                    onClick: () => apiMethods.deleteChannel(chat.id),
                    danger: true,
                }
                : {
                    icon: <img src={TrashIcon} alt="Leave"/>,
                    label: "Leave",
                    onClick: () => apiMethods.leaveChannel(chat.id),
                    danger: true,
                },
        ];
        contextMenu.open(e.clientX, e.clientY, items);
    };

    return (
        <>
            <div
                className={`${styles.chatItem} ${isActive ? styles.activeChat : ""} ${
                    isCollapsed ? styles.collapsed : ""
                }`}
                onClick={() => onSelectChat(chat)}
                onContextMenu={handleContextMenu}
            >
                <ChatAvatar chat={chat}/>
                {!isCollapsed && (
                    <div className={styles.chatInfo}>
                        <div className={styles.chatNameWrapper}>
                            {getIcon()}
                            <span className={styles.chatName}>
								{renderEmojisToJSX(nameToDisplay)}
							</span>
                        </div>
                        <div className={styles.chatMessage}>{lastMessageContent}</div>
                    </div>
                )}
            </div>
            {contextMenu.isOpen && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={contextMenu.items}
                    onClose={contextMenu.close}
                />
            )}
        </>
    );
};

export default observer(ChatItemComponent);
