package org.kollappbackend.apiversion.adapters.primary.rest;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.apiversion.adapters.primary.rest.model.ApiVersionTO;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.core.config.properties.ApplicationProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;

@RestController
@PrimaryAdapter
@RequestMapping("/api/public/version")
@AllArgsConstructor
public class VersionController {

    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private MessageSource messageSource;

    @GetMapping()
    @Operation(summary = "Get the api version")
    public ResponseEntity<ResponseTO> getVersion() {
        ApiVersionTO apiVersionTO = new ApiVersionTO(applicationProperties.getVersion());
        return ResponseEntity.ok(new DataResponseTO(apiVersionTO, "success.apiversion.get", messageSource));
    }
}
