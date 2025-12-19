package org.kollapp.user.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;

import org.kollapp.user.adapters.primary.rest.dto.AccessTokenTO;
import org.kollapp.user.application.model.AccessToken;

@Mapper(componentModel = "spring")
public interface AccessTokenMapper {
    AccessTokenTO accessTokenToAccessTokenTO(AccessToken accessToken);
}
