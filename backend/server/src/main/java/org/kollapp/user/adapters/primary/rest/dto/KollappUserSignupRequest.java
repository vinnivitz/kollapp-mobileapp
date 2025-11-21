package org.kollapp.user.adapters.primary.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class KollappUserSignupRequest {
    @NotBlank(message = "{validation.username.required}")
    @Pattern(regexp = ".{2,}", message = "{validation.username.minlength}")
    @Size(max = 20, message = "{validation.username.maxlength}")
    private String username;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    @Size(max = 50, message = "{validation.email.maxlength}")
    private String email;

    @NotBlank(message = "{validation.password.required}")
    @Pattern(regexp = ".{8,}", message = "{validation.password.minlength}")
    @Size(max = 255, message = "{validation.password.maxlength}")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
            message = "{validation.password.pattern}")
    private String password;
}
