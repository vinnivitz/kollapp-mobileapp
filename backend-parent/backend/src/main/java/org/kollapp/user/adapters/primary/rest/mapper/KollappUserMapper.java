package org.kollapp.user.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Service;

import org.kollapp.user.adapters.primary.rest.dto.KollappUserTO;
import org.kollapp.user.application.model.KollappUser;

@Mapper(componentModel = "spring")
@Service
public interface KollappUserMapper {
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    KollappUserTO kollappUserToKollappUserTO(KollappUser user);
}
