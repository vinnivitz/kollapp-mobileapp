package org.kollapp.organization.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.kollapp.organization.adapters.primary.rest.dto.PostingCreateUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PostingTO;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;

@Mapper(componentModel = "spring")
public interface PostingMapper {

    PostingTO mapPostingToPostingTO(Posting posting);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    OrganizationPosting mapPostingTOToOrganizationPosting(PostingCreateUpdateRequestTO postingCreateUpdateRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activity", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ActivityPosting mapPostingTOToActivityPosting(PostingCreateUpdateRequestTO postingCreateUpdateRequestTO);
}
