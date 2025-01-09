package com.none.kollappbackend.core.util;

import com.none.kollappbackend.organization.application.model.ClientPlatform;

public class ClientPlatformContext {
    private static final ThreadLocal<ClientPlatform> clientPlatformHolder = new ThreadLocal<>();

    public static void setClientPlaform(ClientPlatform clientPlatform) {
        clientPlatformHolder.set(clientPlatform);
    }

    public static ClientPlatform getClientPlatform() {
        return clientPlatformHolder.get();
    }

    public static void clear() {
        clientPlatformHolder.remove();
    }
}
