package com.none.orgaappbackend.user.adapters.primary.rest.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.*;

@Getter
@Setter
@Builder(builderClassName = "UserTOBuilder", toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonDeserialize(builder = UserTO.UserTOBuilder.class)
public class UserTO {
    private long id;
    private String username;
    private String name;
    private String surname;
    private String role;
    private String email;
}
