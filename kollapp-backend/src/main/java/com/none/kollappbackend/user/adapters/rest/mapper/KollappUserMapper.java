package com.none.kollappbackend.user.adapters.rest.mapper;

import com.none.kollappbackend.user.adapters.rest.model.KollappUserTO;
import com.none.kollappbackend.user.application.model.KollappUser;
import org.mapstruct.Mapper;

@Mapper
public interface KollappUserMapper {
    KollappUserTO userToUserTO(KollappUser user);
    KollappUser UserTOToUser(KollappUserTO userTO);
}
