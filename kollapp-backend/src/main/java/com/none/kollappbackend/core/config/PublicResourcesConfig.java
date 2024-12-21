package com.none.kollappbackend.core.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.none.kollappbackend.core.config.properties.ApplicationProperties;

@Configuration
public class PublicResourcesConfig implements WebMvcConfigurer {
    @Autowired
    private ApplicationProperties applicationProperties;

    @SuppressWarnings("null")
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("/public", "classpath:/static/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(applicationProperties.getStaticCacheDays())));
    }
}
