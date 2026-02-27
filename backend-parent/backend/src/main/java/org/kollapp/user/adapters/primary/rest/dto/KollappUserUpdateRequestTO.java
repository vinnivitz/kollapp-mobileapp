package org.kollapp.user.adapters.primary.rest.dto;

import jakarta.validation.constraints.Email;
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
    @Size(min = 2, message = "{validation.username.minlength}")
    @Size(max = 20, message = "{validation.username.maxlength}")
    private String username;

    @Email(message = "{validation.email.invalid}")
    @Size(max = 50, message = "{validation.email.maxlength}")
    private String email;
}
