package org.kollappbackend.user.adapters.rest.mapper;

import org.kollappbackend.user.adapters.rest.model.KollappUserTO;
import org.kollappbackend.user.application.model.KollappUser;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Service;

@Mapper(componentModel = "spring")
@Service
public interface KollappUserMapper {
    KollappUserTO userToUserTO(KollappUser user);
}
