package org.kollappbackend.organization.adapters.primary.rest.mapper;

import org.kollappbackend.organization.adapters.primary.rest.dto.ActivityCreationRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.dto.ActivityTO;
import org.kollappbackend.organization.adapters.primary.rest.dto.ActivityUpdateRequestTO;
import org.kollappbackend.organization.application.model.Activity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = PostingMapper.class)
public interface ActivityMapper {
    ActivityTO activityToActivityTO(Activity activity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    @Mapping(target = "activityPostings", ignore = true)
    Activity activityCreationRequestTOToActivity(
            ActivityCreationRequestTO activityCreationRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    @Mapping(target = "activityPostings", ignore = true)
    Activity activityUpdateTOToActivity(ActivityUpdateRequestTO activityUpdateRequestTO);
}
