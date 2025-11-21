package org.kollappbackend.user.adapters.primary.rest.mapper;

import org.kollappbackend.user.adapters.primary.rest.dto.KollappUserTO;
import org.kollappbackend.user.application.model.KollappUser;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Service;

@Mapper(componentModel = "spring")
@Service
public interface KollappUserMapper {
    KollappUserTO userToUserTO(KollappUser user);
}
