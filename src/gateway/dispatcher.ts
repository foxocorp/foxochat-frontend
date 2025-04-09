import { EventPayloadMap, EmitFunc, EventHandlers } from "./types";
import { Logger } from "@utils/logger";
import { messageEventHandlers } from "./events/messageEventHandlers.ts";
import { channelEventHandlers } from "./events/channelEventHandlers.ts";
import { memberEventHandlers } from "./events/memberEventHandlers.ts";

export const allHandlers: EventHandlers = {
    ...channelEventHandlers,
    ...memberEventHandlers,
    ...messageEventHandlers,
};

export const dispatchEvent = <T extends keyof EventPayloadMap>(
    eventType: T,
    data: EventPayloadMap[T],
    emit: EmitFunc,
): void => {
    const handler = allHandlers[eventType] as EventHandlers[T];
    if (handler) {
        (handler as (data: EventPayloadMap[T], emit: EmitFunc) => void)(data, emit);
    } else {
        Logger.warn(`Unhandled event type: ${eventType}`);
    }
};
