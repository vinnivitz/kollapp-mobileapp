package com.none.kollappbackend.user.adapters.rest.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordChangeRequestTO {
    @NotBlank(message = "{validation.password.required}")
    private String currentPassword;

    @NotBlank(message = "{validation.password.required}")
    @Pattern(regexp = ".{8,}", message = "{validation.password.minlength}")
    @Size(max = 255, message = "{validation.password.maxlength}")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "{validation.password.pattern}")
    private String newPassword;
}
