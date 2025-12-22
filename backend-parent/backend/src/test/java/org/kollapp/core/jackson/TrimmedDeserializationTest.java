package org.kollapp.core.jackson;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.kollapp.organization.adapters.primary.rest.dto.OrganizationCreationRequestTO;
import org.kollapp.user.adapters.primary.rest.dto.LoginRequestTO;

class TrimmedDeserializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void trimsOnlyAnnotatedProperties() throws Exception {
        String json =
                """
                {
                  "username": "  nina  ",
                  "password": "  secret  "
                }
                """;

        LoginRequestTO request = objectMapper.readValue(json, LoginRequestTO.class);

        assertThat(request.getUsername()).isEqualTo("nina");
        assertThat(request.getPassword()).isEqualTo("  secret  ");
    }

    @Test
    void trimsNullableAnnotatedProperties() throws Exception {
        String json =
                """
                {
                  "name": "  My Org  ",
                  "place": "  Berlin  ",
                  "description": null
                }
                """;

        OrganizationCreationRequestTO request = objectMapper.readValue(json, OrganizationCreationRequestTO.class);

        assertThat(request.getName()).isEqualTo("My Org");
        assertThat(request.getPlace()).isEqualTo("Berlin");
        assertThat(request.getDescription()).isNull();
    }
}
