package com.none.kollappbackend.core.config;

import com.none.kollappbackend.core.util.ClientPlatformContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ClientPlatformFilter extends OncePerRequestFilter {

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws java.io.IOException, jakarta.servlet.ServletException {
        String userAgent = request.getHeader("User-Agent");
        ClientPlatform clientPlatform = determineClientPlatform(userAgent);

        ClientPlatformContext.setClientPlaform(clientPlatform);
        try {
            filterChain.doFilter(request, response);
        } finally {
            ClientPlatformContext.clear();
        }
    }

    /**
     * Determines the client type based on the User-Agent header.
     *
     * @param userAgent the User-Agent string
     * @return "android" if the client is an Android device, otherwise "web"
     */
    private ClientPlatform determineClientPlatform(String userAgent) {
        if (userAgent != null && userAgent.toLowerCase().contains("android")) {
            return ClientPlatform.ANDROID;
        }
        return ClientPlatform.WEB;
    }
}
