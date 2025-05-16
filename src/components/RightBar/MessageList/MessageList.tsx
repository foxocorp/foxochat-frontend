import { observer } from "mobx-react";
import MessageGroup from "@components/RightBar/MessageList/MessageGroup/MessageGroup";
import styles from "./MessageList.module.scss";
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
            <div ref={messageListRef} onScroll={onScroll} className={styles.messageList}>
                <MessageLoader />
            </div>
        );
    }

    const dayGroups: { date: string; msgs: typeof messages }[] = [];
    let currentDay = "";
    for (const msg of messages) {
        const d = dayjs(msg.created_at).format("YYYY-MM-DD");
        if (d !== currentDay) {
            dayGroups.push({ date: d, msgs: [msg] });
            currentDay = d;
        } else {
            dayGroups[dayGroups.length - 1].msgs.push(msg);
        }
    }

    return (
        <div ref={messageListRef} onScroll={onScroll} className={styles.messageList}>
            {dayGroups.map(({ date, msgs }) => {
                const groups: { msgs: typeof msgs }[] = [];
                let grp = msgs.slice(0, 1);
                let lastAuthor = msgs[0].author.user.id;
                for (let i = 1; i < msgs.length; i++) {
                    const msg = msgs[i];
                    const prev = msgs[i - 1];
                    const timeoutSplit = msg.created_at - prev.created_at > 300_000;
                    if (msg.author.user.id !== lastAuthor || timeoutSplit) {
                        groups.push({ msgs: grp });
                        grp = [msg];
                        lastAuthor = msg.author.user.id;
                    } else {
                        grp.push(msg);
                    }
                }
                groups.push({ msgs: grp });

                return (
                    <div key={date}>
                        <div className={styles.stickyDate}>
                            {dayjs(date).isToday() ? "Today" : dayjs(date).format("D MMMM YYYY")}
                        </div>
                        {groups.map((g, idx) => (
                            <MessageGroup
                                key={`${date}-${g.msgs[0].id}-${idx}`}
                                messages={g.msgs}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default observer(MessageListComponent);