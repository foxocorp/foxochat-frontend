export interface Message {
    content: string,
    timestamp?: string | undefined;
    isSender: boolean,
}

export interface Chat {
    name: string;
    displayName: string;
    avatar: string | null;
    isGroup: boolean;
    isChannel: boolean;
    lastMessage: {
        sender: string;
        senderId: string;
        text: string;
        timestamp: number;
    };
}
