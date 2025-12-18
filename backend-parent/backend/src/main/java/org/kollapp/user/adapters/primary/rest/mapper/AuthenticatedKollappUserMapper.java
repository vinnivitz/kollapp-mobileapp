package org.kollapp.user.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;

import org.kollapp.user.adapters.primary.rest.dto.AuthenticatedKollappUserTO;
import org.kollapp.user.application.model.AuthenticatedKollappUser;

@Mapper(componentModel = "spring")
public interface AuthenticatedKollappUserMapper {
    AuthenticatedKollappUserTO authenticatedKollappUserToAuthenticatedKollappUserTO(
            AuthenticatedKollappUser authenticatedKollappUser);
}
