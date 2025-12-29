package org.kollapp.organization.adapters.secondary.db;

import java.util.Optional;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import org.kollapp.organization.adapters.secondary.db.jpa.OrganizationInvitationCodeJpaRepository;
import org.kollapp.organization.application.model.OrganizationInvitationCode;
import org.kollapp.organization.application.repository.OrganizationInvitationCodeRepository;

@SecondaryAdapter
@Repository
public class OrganizationInvitationCodeRepositoryImpl implements OrganizationInvitationCodeRepository {

    @Autowired
    private OrganizationInvitationCodeJpaRepository jpaRepository;

    @Override
    public Optional<OrganizationInvitationCode> findByInvitationCodeAndExpirationDateIsAfter(
            String invitationCode, String currentDateMinusOneDay) {
        return jpaRepository.findByCodeIgnoreCaseAndExpirationDateIsAfter(invitationCode, currentDateMinusOneDay);
    }
}
