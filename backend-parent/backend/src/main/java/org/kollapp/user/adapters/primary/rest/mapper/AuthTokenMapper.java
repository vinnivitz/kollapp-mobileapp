package org.kollapp.user.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;

import org.kollapp.user.adapters.primary.rest.dto.AuthTokenTO;
import org.kollapp.user.application.model.AuthToken;

@Mapper(componentModel = "spring")
public interface AuthTokenMapper {
    AuthTokenTO authTokenToAuthTokenTO(AuthToken authToken);
}
