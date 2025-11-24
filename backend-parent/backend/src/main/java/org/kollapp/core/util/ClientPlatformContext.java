package org.kollapp.core.util;

import org.kollapp.core.config.ClientPlatform;

public class ClientPlatformContext {
    private static final ThreadLocal<ClientPlatform> clientPlatformHolder = new ThreadLocal<>();

    public static void setClientPlaform(ClientPlatform clientPlatform) {
        clientPlatformHolder.set(clientPlatform);
    }

    public static void clear() {
        clientPlatformHolder.remove();
    }
}
