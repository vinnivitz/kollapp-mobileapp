package com.none.kollappbackend.user.adapters.rest.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KollappUserTO {

    private Long id;

    @Pattern(regexp = ".{2,}", message = "{validation.username.minlength}")
    @Size(max = 20, message = "{validation.username.maxlength}")
    private String username;

    @Email(message = "{validation.email.invalid}")
    @Size(max = 50, message = "{validation.email.maxlength}")
    private String email;

    private boolean activated;

    private String surname;

    private String name;

    private List<String> roles;
}
