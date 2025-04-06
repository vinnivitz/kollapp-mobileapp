package org.kollappbackend.core.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class ResponseUtil {
    public void createMessageResponse(HttpServletResponse response, int code, String message) throws IOException {
        log.error("Error response: " + message);
        response.setStatus(code);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponseTO responseBody = new ErrorResponseTO(message);
        response.getWriter().write(new ObjectMapper().writeValueAsString(responseBody));
        response.getWriter().flush();
    }
}
