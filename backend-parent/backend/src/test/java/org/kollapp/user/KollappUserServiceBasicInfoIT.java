package org.kollapp.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import org.kollapp.core.BaseIT;
import org.kollapp.user.application.exception.KollappUserNotFoundException;
import org.kollapp.user.application.exception.NoSharedOrganizationsException;
import org.kollapp.user.application.model.BasicUserInfo;
import org.kollapp.user.application.service.KollappUserService;

@Sql(scripts = "/sql/user/base_data_user_basic_info.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
public class KollappUserServiceBasicInfoIT extends BaseIT {

    @Autowired
    private KollappUserService kollappUserService;

    @Test
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void getBasicUserInfoShouldReturnUserInfoWhenUsersShareOrganization() {
        // nina (id=1) and orgamanager (id=2) both are approved members of organization 1
        BasicUserInfo basicUserInfo = kollappUserService.getBasicUserInfo(2L);

        assertThat(basicUserInfo.getUsername()).isEqualTo("orgamanager");
        assertThat(basicUserInfo.getCommonOrganizationIds()).containsExactly(1L);
    }

    @Test
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void getBasicUserInfoShouldReturnMultipleOrganizationsWhenUsersShareMultiple() {
        // nina (id=1) and thirduser (id=3) share both organization 1 and 3
        BasicUserInfo basicUserInfo = kollappUserService.getBasicUserInfo(3L);

        assertThat(basicUserInfo.getUsername()).isEqualTo("thirduser");
        assertThat(basicUserInfo.getCommonOrganizationIds()).containsExactlyInAnyOrder(1L, 3L);
    }

    @Test
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void getBasicUserInfoShouldThrowExceptionWhenUsersShareNoOrganization() {
        // nina (id=1) and fourthuser (id=4) share no organizations
        assertThatExceptionOfType(NoSharedOrganizationsException.class)
                .isThrownBy(() -> kollappUserService.getBasicUserInfo(4L));
    }

    @Test
    @WithMockUser(
            username = "pendinguser",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void getBasicUserInfoShouldThrowExceptionWhenRequesterIsNotApproved() {
        // pendinguser (id=5) has only PENDING status in organization 2
        assertThatExceptionOfType(NoSharedOrganizationsException.class)
                .isThrownBy(() -> kollappUserService.getBasicUserInfo(2L));
    }

    @Test
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void getBasicUserInfoShouldThrowExceptionWhenTargetUserIsNotApprovedInSharedOrg() {
        // nina (id=1) and pendinguser (id=5) are in organization 2, but pendinguser is PENDING
        // nina is approved in org 1 and 3, pendinguser is pending in org 2
        // they share no approved organizations
        assertThatExceptionOfType(NoSharedOrganizationsException.class)
                .isThrownBy(() -> kollappUserService.getBasicUserInfo(5L));
    }

    @Test
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void getBasicUserInfoShouldThrowExceptionWhenTargetUserDoesNotExist() {
        assertThatExceptionOfType(KollappUserNotFoundException.class)
                .isThrownBy(() -> kollappUserService.getBasicUserInfo(999L));
    }

    @Test
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void getBasicUserInfoShouldWorkForSelf() {
        // User can get their own basic info
        BasicUserInfo basicUserInfo = kollappUserService.getBasicUserInfo(1L);

        assertThat(basicUserInfo.getUsername()).isEqualTo("nina");
        assertThat(basicUserInfo.getCommonOrganizationIds()).containsExactlyInAnyOrder(1L, 3L);
    }
}
