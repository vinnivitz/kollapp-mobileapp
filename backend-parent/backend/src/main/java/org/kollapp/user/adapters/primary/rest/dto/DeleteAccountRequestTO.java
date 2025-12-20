package org.kollapp.user.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DeleteAccountRequestTO {
    @NotBlank(message = "{validation.password.required}")
    private String password;
}
