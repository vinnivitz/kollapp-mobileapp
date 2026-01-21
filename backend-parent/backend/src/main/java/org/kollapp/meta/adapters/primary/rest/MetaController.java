package org.kollapp.meta.adapters.primary.rest;

import lombok.AllArgsConstructor;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.meta.adapters.primary.rest.dto.MetaTO;
import org.kollapp.meta.config.MetaProperties;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@PrimaryAdapter
@RequestMapping("/api/public/meta")
@AllArgsConstructor
public class MetaController {
    private final MetaProperties metaProperties;

    private final MessageUtil messageUtil;

    @GetMapping()
    @Operation(summary = "Get application meta information")
    public ResponseEntity<DataResponseTO<MetaTO>> getMeta() {
        MetaTO metaTO = new MetaTO(metaProperties.getClientVersion());
        String message = messageUtil.getMessage("success.meta.get");
        return ResponseEntity.ok(new DataResponseTO<>(metaTO, message));
    }
}
