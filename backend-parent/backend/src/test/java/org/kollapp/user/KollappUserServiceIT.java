package org.kollapp.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import org.kollapp.core.BaseIT;
import org.kollapp.user.application.exception.IncorrectPasswordException;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.repository.KollappUserRepository;
import org.kollapp.user.application.service.KollappUserService;

@Sql(scripts = "/sql/user/base_data_user.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_USER"})
public class KollappUserServiceIT extends BaseIT {

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private KollappUserRepository kollappUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void deleteKollappUserShouldThrowIncorrectPasswordException() {
        KollappUser nina = kollappUserRepository.findByUsername("nina").orElseThrow();
        nina.setPassword(passwordEncoder.encode("correctPassword"));
        kollappUserRepository.save(nina);

        assertThatExceptionOfType(IncorrectPasswordException.class)
                .isThrownBy(() -> kollappUserService.deleteKollappUser("wrongPassword"));
    }

    @Test
    public void changePasswordShouldThrowIncorrectPasswordException() {
        KollappUser nina = kollappUserRepository.findByUsername("nina").orElseThrow();
        nina.setPassword(passwordEncoder.encode("correctPassword"));
        kollappUserRepository.save(nina);

        assertThatExceptionOfType(IncorrectPasswordException.class)
                .isThrownBy(() -> kollappUserService.changePassword("wrongPassword", "newPassword"));
    }
}
