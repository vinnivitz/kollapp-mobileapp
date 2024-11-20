package com.none.orgaappbackend.user.application;

import com.none.orgaappbackend.user.application.model.ERole;
import com.none.orgaappbackend.user.application.model.Role;

import java.util.Optional;

public interface RoleRepository {
    Optional<Role> findByName(ERole name);
}
