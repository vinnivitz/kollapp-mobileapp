package com.none.orgaappbackend.organization.adapters.primary.rest.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.*;

@Getter
@Setter
@Builder(builderClassName = "UserTOBuilder", toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonDeserialize(builder = OrganizationTO.UserTOBuilder.class)
public class OrganizationTO {
    private long id;
    private String username;
    private String name;
    private String email;
}
