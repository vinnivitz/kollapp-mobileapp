package org.kollapp.organization.application.service;

import java.util.List;

import org.jmolecules.architecture.hexagonal.PrimaryPort;

import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationBudgetCategory;
import org.kollapp.organization.application.model.OrganizationRole;

@PrimaryPort
public interface OrganizationService {
    List<Organization> getOrganizationsByLoggedInUser();

    Organization getOrganizationById(long id);

    Organization getOrganizationByInvitationCode(String invitationCode);

    Organization createOrganization(Organization organization);

    Organization updateOrganization(Organization updatedOrganization, long organizationId);

    Organization deleteUserFromOrganization(long personOfOrganizationId, long organizationId);

    Organization generateNewOrganizationInvitationCode(long organizationId);

    Organization enterOrganizationByInvitationCode(String invitationCode);

    void deleteUserFromAllOrganizations(long userId);

    void leaveOrganization(long organizationId);

    void updatePersonOfOrganizationsOfUser(long userId, String username);

    Organization approveNewMemberRequest(long organizationId, long personId);

    Organization grantRoleToPersonOfOrganization(long organizationId, long personId, OrganizationRole role);

    Organization addBudgetCategory(long organizationId, OrganizationBudgetCategory budgetCategory);

    Organization editBudgetCategory(
            long organizationId, long budgetCategoryId, OrganizationBudgetCategory updatedBudgetCategory);

    Organization deleteBudgetCategory(long organizationId, long budgetCategoryId);
}
