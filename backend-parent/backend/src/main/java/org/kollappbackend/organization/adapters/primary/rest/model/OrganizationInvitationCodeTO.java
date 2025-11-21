package org.kollappbackend.organization.adapters.primary.rest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class OrganizationInvitationCodeTO {
    private String code;
    private String expirationDate;
}
