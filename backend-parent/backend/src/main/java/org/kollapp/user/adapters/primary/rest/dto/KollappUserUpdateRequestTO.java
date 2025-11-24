package org.kollapp.user.adapters.primary.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KollappUserUpdateRequestTO {
    @NotBlank(message = "{validation.user.username.required}")
    @Pattern(regexp = ".{2,}", message = "{validation.username.minlength}")
    @Size(max = 20, message = "{validation.username.maxlength}")
    private String username;

    @NotBlank(message = "{validation.user.email.required}")
    @Email(message = "{validation.email.invalid}")
    @Size(max = 50, message = "{validation.email.maxlength}")
    private String email;
}
