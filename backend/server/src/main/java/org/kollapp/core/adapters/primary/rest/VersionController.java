package org.kollapp.core.adapters.primary.rest;

import lombok.AllArgsConstructor;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.dto.ApiVersionTO;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.config.properties.ApplicationProperties;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@PrimaryAdapter
@RequestMapping("/api/public/version")
@AllArgsConstructor
public class VersionController {

    @Autowired private final ApplicationProperties applicationProperties;

    @Autowired private final MessageSource messageSource;

    @GetMapping()
    @Operation(summary = "Get the api version")
    public ResponseEntity<DataResponseTO<ApiVersionTO>> getVersion() {
        ApiVersionTO apiVersionTO = new ApiVersionTO(applicationProperties.getVersion());
        return ResponseEntity.ok(
                new DataResponseTO<>(apiVersionTO, "success.apiversion.get", messageSource));
    }
}
