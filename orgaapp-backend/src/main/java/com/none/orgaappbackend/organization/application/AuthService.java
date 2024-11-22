package com.none.orgaappbackend.organization.application;

import com.none.orgaappbackend.organization.adapters.primary.rest.model.LoginResponse;

public interface AuthService {
    LoginResponse authenticate(String username, String password);
}
