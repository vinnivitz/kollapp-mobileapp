package com.none.kollappbackend.util;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.none.kollappbackend.core.adapters.primary.model.ErrorResponseTO;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ResponseUtil {
    public void createMessageResponse(HttpServletResponse response, int code, String message)
            throws JsonProcessingException, IOException {
        log.error("Error response:", message);
        response.setStatus(code);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponseTO responseBody = new ErrorResponseTO(message);
        response.getWriter().write(new ObjectMapper().writeValueAsString(responseBody));
        response.getWriter().flush();
    }
}
