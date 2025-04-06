package org.kollappbackend.core.util;

import org.kollappbackend.core.config.ClientPlatform;

public class ClientPlatformContext {
    private static final ThreadLocal<ClientPlatform> clientPlatformHolder = new ThreadLocal<>();

    public static void setClientPlaform(ClientPlatform clientPlatform) {
        clientPlatformHolder.set(clientPlatform);
    }

    public static void clear() {
        clientPlatformHolder.remove();
    }
}
