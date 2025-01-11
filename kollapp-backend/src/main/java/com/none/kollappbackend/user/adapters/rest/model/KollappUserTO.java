package com.none.kollappbackend.user.adapters.rest.model;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KollappUserTO {
    private Long id;
    private String username;
    private String surname;
    private String name;
    private String email;
    private boolean isActivated;
    private List<String> roles;
}
