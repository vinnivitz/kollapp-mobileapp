package org.kollapp.organization.application.repository;

import java.util.Optional;

import org.kollapp.organization.application.model.OrganizationInvitationCode;

public interface OrganizationInvitationCodeRepository {
    Optional<OrganizationInvitationCode> findByInvitationCodeAndExpirationDateIsAfter(
            String invitationCode, String currentDateMinusOneDay);
}
