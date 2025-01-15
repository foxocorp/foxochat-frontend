import { APIUser } from "@foxogram/api-types";

export interface User {
    user: APIUser;
    channels: number[];
    id: number;
    avatar: string;
    display_name: string;
    username: string;
    flags: number;
    type: number;
    created_at: number;
}

export interface Author {
    member: string;
    id: number;
    user: User;
    permissions: number;
    joined_at: number;
}

export interface Message {
    id: number;
    content: string;
    author: Author;
    channel: number;
    attachments: string[];
    created_at: number;
}

export interface Channel {
    id: number;
    display_name: string;
    name: string;
    icon: string | null;
    type: number;
    owner: User;
    created_at: number;
    lastMessage: Message | null;
}
