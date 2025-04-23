import {
    APIUser,
    APIChannel,
    APIMember,
    APIMessage,
    ChannelType,
    UserFlags,
    UserType,
    MemberPermissions,
} from "@foxogram/api-types";
import { fallbackMember } from "./constants";

export function normalizePermissions(permissions: string | number): number {
    return typeof permissions === "string"
        ? parseInt(permissions, 10) || MemberPermissions.SendMessages
        : permissions;
}

export function normalizeChannelType(type: string | ChannelType | undefined): ChannelType {
    if (typeof type === "string") {
        return ChannelType[type as keyof typeof ChannelType] ?? ChannelType.DM;
    }
    return type ?? ChannelType.DM;
}

export function transformApiUserToUser(apiUser?: APIUser): APIUser {
    return {
        id: apiUser?.id ?? 0,
        channels: apiUser?.channels ?? [],
        avatar: apiUser?.avatar ?? "",
        displayName: apiUser?.display_name ?? apiUser?.username ?? "Unknown User",
        username: apiUser?.username ?? "unknown",
        email: apiUser?.email ?? "",
        flags: apiUser?.flags ?? UserFlags.Disabled,
        type: apiUser?.type ?? UserType.User,
        createdAt: apiUser?.created_at ?? Date.now(),
    };
}

export function transformApiMember(apiMember: APIMember): APIMember {
    return {
        id: apiMember.id,
        user: transformApiUserToUser(apiMember.user),
        channelId: apiMember.channel.id,
        permissions: normalizePermissions(apiMember.permissions),
        joinedAt: apiMember.joined_at,
    };
}

export function transformToMessage(data: APIMessage): APIMessage {
    const author = data.author ?? fallbackMember;

    return {
        id: data.id,
        content: data.content,
        attachments: data.attachments,
        author: transformApiMember(author),
        channelId: data.channel.id,
        createdAt: data.created_at,
    };
}

export function createChannelFromAPI(c: APIChannel): APIChannel | null {
    try {
        return {
            id: c.id ?? 0,
            name: c.name ?? "unnamed-channel",
            displayName: c.display_name ?? c.name ?? "Unnamed Channel",
            icon: c.icon ?? "",
            type: normalizeChannelType(c.type),
            memberCount: c.member_count ?? 0,
            owner: transformApiUserToUser(c.owner),
            createdAt: c.created_at ?? Date.now(),
            lastMessage: c.last_message
                ? transformToMessage(c.last_message)
                : undefined,
        };
    } catch (e) {
        console.error("createChannelFromAPI error:", e);
        return null;
    }
}