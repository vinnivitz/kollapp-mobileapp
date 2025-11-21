package org.kollappbackend.organization.adapters.secondary.db;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.organization.adapters.secondary.db.jpa.OrganizationInvitationCodeJpaRepository;
import org.kollappbackend.organization.application.model.OrganizationInvitationCode;
import org.kollappbackend.organization.application.repository.OrganizationInvitationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@SecondaryAdapter
@Repository
public class OrganizationInvitationCodeRepositoryImpl implements OrganizationInvitationCodeRepository {

    @Autowired
    private OrganizationInvitationCodeJpaRepository jpaRepository;

    @Override
    public Optional<OrganizationInvitationCode> findByInvitationCodeAndExpirationDateIsAfter(String invitationCode,
                                                                                              String currentDateMinusOneDay) {
        return jpaRepository.findByCodeAndExpirationDateIsAfter(invitationCode, currentDateMinusOneDay);
    }
}
