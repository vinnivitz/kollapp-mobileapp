package org.kollapp.core.util;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import org.kollapp.core.config.ClientPlatform;
import org.kollapp.core.config.properties.ApplicationProperties;
import org.kollapp.core.config.properties.ClientProperties;

@Component
public class UrlBuilderUtil {
    @Autowired private ApplicationProperties applicationProperties;

    @Autowired private ClientProperties clientProperties;

    public String buildServerUrl(String path, Map<String, String> queryMap) {
        String baseUrl =
                "http"
                        + (Boolean.parseBoolean(applicationProperties.getProduction()) ? "s" : "")
                        + "://"
                        + applicationProperties.getHost()
                        + (Boolean.parseBoolean(applicationProperties.getProduction())
                                ? ""
                                : (":" + applicationProperties.getPort()))
                        + (path != null ? path : "");

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(baseUrl);

        uriBuilder.queryParam("locale", LocaleContextHolder.getLocale());

        if (queryMap != null) {
            queryMap.forEach(uriBuilder::queryParam);
        }

        return uriBuilder.toUriString();
    }

    public String buildServerUrl() {
        return buildServerUrl(null, null);
    }

    public String buildServerUrl(String path) {
        return buildServerUrl(path, null);
    }

    public String buildServerUrl(Map<String, String> queryMap) {
        return buildServerUrl(null, queryMap);
    }

    public String buildClientUrl(
            ClientPlatform clientPlatform, String path, Map<String, String> queryMap) {
        String baseUrl = getClientBaseUrl(clientPlatform);

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(baseUrl + path);

        if (queryMap != null) {
            queryMap.forEach(uriBuilder::queryParam);
        }

        return uriBuilder.toUriString();
    }

    public String buildClientUrl() {
        return buildClientUrl(null, null);
    }

    public String buildClientUrl(ClientPlatform clientPlatform, String path) {
        return getClientBaseUrl(clientPlatform) + path;
    }

    public String buildClientUrl(Map<String, String> queryMap) {
        return buildClientUrl(null, null, queryMap);
    }

    private String getClientBaseUrl(ClientPlatform clientPlatform) {
        return switch (clientPlatform) {
            case ANDROID -> clientProperties.getAndroidBaseUrl();
            case WEB -> clientProperties.getWebBaseUrl();
            default -> null;
        };
    }
}
