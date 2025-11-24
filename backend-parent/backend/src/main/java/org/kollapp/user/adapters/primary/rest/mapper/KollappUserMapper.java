package org.kollapp.user.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Service;

import org.kollapp.user.adapters.primary.rest.dto.KollappUserTO;
import org.kollapp.user.application.model.KollappUser;

@Mapper(componentModel = "spring")
@Service
public interface KollappUserMapper {
    KollappUserTO userToUserTO(KollappUser user);
}
