package com.none.orgaappbackend.organization.application.service;

import com.none.orgaappbackend.organization.adapters.primary.rest.model.LoginResponse;

public interface AuthService {
    LoginResponse authenticate(String username, String password);
}
