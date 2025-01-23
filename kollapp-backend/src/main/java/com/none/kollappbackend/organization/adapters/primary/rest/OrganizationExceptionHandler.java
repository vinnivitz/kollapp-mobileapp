package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.ErrorResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Order(1)
@Slf4j
@ControllerAdvice(basePackages = {"com.none.kollappbackend.organization"})
public class OrganizationExceptionHandler {
    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<ResponseTO> handleOrganizationNotFound(OrganizationNotFoundException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponseTO(ex.getMessage()));
    }
}
