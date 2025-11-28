package org.kollapp.organization;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.kollapp.core.BaseIT;
import org.kollapp.organization.application.service.BudgetAccountService;

@Sql(
        scripts = "/sql/organization/base_data_organization_kollapp_user.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
@Sql(scripts = "/sql/clear.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_CLASS)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_USER"})
public class BudgetAccountServiceKollappUserIT extends BaseIT {

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Test
    public void addOrganizationPostingShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> budgetAccountService.addOrganizationPosting(1L, null));
    }

    @Test
    public void editOrganizationPostingShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> budgetAccountService.editOrganizationPosting(1L, 1L, null));
    }

    @Test
    public void deleteOrganizationPostingShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> budgetAccountService.deleteOrganizationPosting(1L, 1L));
    }

    @Test
    public void addActivityPostingShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> budgetAccountService.addOrganizationPosting(1L, null));
    }

    @Test
    public void editActivityPostingShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> budgetAccountService.editOrganizationPosting(1L, 1L, null));
    }

    @Test
    public void deleteActivityPostingShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> budgetAccountService.deleteOrganizationPosting(1L, 1L));
    }
}
