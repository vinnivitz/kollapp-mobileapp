package org.kollappbackend.organization.adapters.primary.rest.mapper;

import org.kollappbackend.organization.adapters.primary.rest.dto.PostingCreateUpdateRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.dto.PostingTO;
import org.kollappbackend.organization.application.model.ActivityPosting;
import org.kollappbackend.organization.application.model.OrganizationPosting;
import org.kollappbackend.organization.application.model.Posting;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PostingMapper {

    PostingTO mapPostingToPostingTO(Posting posting);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    OrganizationPosting mapPostingTOToOrganizationPosting(
            PostingCreateUpdateRequestTO postingCreateUpdateRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activity", ignore = true)
    ActivityPosting mapPostingTOToActivityPosting(
            PostingCreateUpdateRequestTO postingCreateUpdateRequestTO);
}
