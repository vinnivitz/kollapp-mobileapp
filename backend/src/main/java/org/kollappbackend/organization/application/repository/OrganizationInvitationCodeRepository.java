package org.kollappbackend.organization.application.repository;

import org.kollappbackend.organization.application.model.OrganizationInvitationCode;

import java.util.Optional;

public interface OrganizationInvitationCodeRepository {
    Optional<OrganizationInvitationCode> findByInvitationCodeAndExpirationDateIsAfter(String invitationCode,
                                                                                       String currentDateMinusOneDay);
}
