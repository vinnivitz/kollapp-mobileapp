package org.kollapp.organization.adapters.secondary.db.jpa;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.kollapp.organization.application.model.OrganizationInvitationCode;

public interface OrganizationInvitationCodeJpaRepository extends JpaRepository<OrganizationInvitationCode, String> {
    Optional<OrganizationInvitationCode> findByCodeAndExpirationDateIsAfter(String code, String currentDateMinusOneDay);
}
