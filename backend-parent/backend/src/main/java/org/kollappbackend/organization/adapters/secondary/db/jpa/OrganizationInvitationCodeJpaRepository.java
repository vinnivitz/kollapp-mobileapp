package org.kollappbackend.organization.adapters.secondary.db.jpa;

import org.kollappbackend.organization.application.model.OrganizationInvitationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationInvitationCodeJpaRepository extends JpaRepository<OrganizationInvitationCode, String> {
    Optional<OrganizationInvitationCode> findByCodeAndExpirationDateIsAfter(String code,
                                                                             String currentDateMinusOneDay);
}
