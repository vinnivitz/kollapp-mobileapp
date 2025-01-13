package com.none.kollappbackend.user.adapters.rest.mapper;

import com.none.kollappbackend.user.adapters.rest.model.KollappUserTO;
import com.none.kollappbackend.user.application.model.KollappUser;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Service;

@Mapper(componentModel = "spring")
@Service
public interface KollappUserMapper {
    KollappUserTO userToUserTO(KollappUser user);
    KollappUser userTOToUser(KollappUserTO userTO);
}
