package org.kollapp.core.util;

import java.io.IOException;

import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.kollapp.core.adapters.primary.rest.dto.ErrorResponseTO;

@Slf4j
@Component
public class ResponseUtil {
    public void createMessageResponse(HttpServletResponse response, int code, String message)
            throws IOException {
        log.error("Error response: " + message);
        response.setStatus(code);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponseTO responseBody = new ErrorResponseTO(message);
        response.getWriter().write(new ObjectMapper().writeValueAsString(responseBody));
        response.getWriter().flush();
    }
}
