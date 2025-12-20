package org.kollapp.user.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;

import org.kollapp.user.adapters.primary.rest.dto.AuthTokensTO;
import org.kollapp.user.application.model.AuthTokens;

@Mapper(componentModel = "spring")
public interface AuthTokensMapper {
    AuthTokensTO authTokensToAuthTokensTO(AuthTokens tokens);
}
