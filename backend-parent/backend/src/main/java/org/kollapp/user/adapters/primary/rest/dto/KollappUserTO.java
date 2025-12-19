package org.kollapp.user.adapters.primary.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.kollapp.user.adapters.primary.rest.dto.enums.SystemRole;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KollappUserTO {

    private long id;

    private String username;

    private String email;

    private boolean activated;

    private SystemRole role;
}
