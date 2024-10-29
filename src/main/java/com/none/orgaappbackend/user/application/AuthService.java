package com.none.orgaappbackend.user.application;

import com.none.orgaappbackend.user.adapters.primary.rest.model.LoginResponse;

public interface AuthService {
    LoginResponse authenticate(String username, String password);
}
