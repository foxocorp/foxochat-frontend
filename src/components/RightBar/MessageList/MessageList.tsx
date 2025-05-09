import { observer } from "mobx-react";
import MessageGroup from "@components/RightBar/MessageList/MessageGroup/MessageGroup";
import styles from "./MessageList.module.css";
import MessageLoader from "@components/RightBar/MessageList/MessageLoader/MessageLoader";
import type { MessageListProps } from "@interfaces/interfaces";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isToday from "dayjs/plugin/isToday";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);

const MessageListComponent = ({
                                  messages,
                                  isLoading,
                                  isInitialLoading,
                                  currentUserId,
                                  messageListRef,
                                  onScroll,
                              }: MessageListProps & { isLoading: boolean }) => {
    if (isLoading || isInitialLoading) {
        return (
            <div
                ref={messageListRef}
                onScroll={onScroll}
                className={styles["message-list"]}
            >
                <MessageLoader />
            </div>
        );
    }

    const groups: { date: string; msgs: typeof messages }[] = [];
    let grp: typeof messages = [];
    let lastAuthor = -1;
    let lastDate = "";

    for (const msg of messages) {
        const d = dayjs(msg.created_at).format("YYYY-MM-DD");
        const split =
            d !== lastDate ||
            msg.author.user.id !== lastAuthor ||
            (grp.length && msg.created_at - grp[grp.length - 1].created_at > 300_000);

        if (split) {
            if (grp.length) groups.push({ date: lastDate, msgs: grp });
            grp = [msg];
            lastDate = d;
            lastAuthor = msg.author.user.id;
        } else {
            grp.push(msg);
        }
    }

    if (grp.length) groups.push({ date: lastDate, msgs: grp });

    return (
        <div
            ref={messageListRef}
            onScroll={onScroll}
            className={styles["message-list"]}
        >
            {groups.map((g) => (
                <div key={`${g.date}-${g.msgs[0]?.id}`}>
                    {!dayjs(g.date).isToday() && (
                        <div className={styles["sticky-date"]}>
                            {dayjs(g.date).format("MMMM D, YYYY")}
                        </div>
                    )}
                    <MessageGroup
                        messages={g.msgs}
                        currentUserId={currentUserId}
                    />
                </div>
            ))}
        </div>
    );
};

export default observer(MessageListComponent);