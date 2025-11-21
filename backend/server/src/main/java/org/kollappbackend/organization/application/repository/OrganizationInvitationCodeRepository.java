package org.kollappbackend.organization.application.repository;

import java.util.Optional;
import org.kollappbackend.organization.application.model.OrganizationInvitationCode;

public interface OrganizationInvitationCodeRepository {
    Optional<OrganizationInvitationCode> findByInvitationCodeAndExpirationDateIsAfter(
            String invitationCode, String currentDateMinusOneDay);
}
