package org.kollapp.organization.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.kollapp.organization.adapters.primary.rest.dto.ActivityCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityUpdateRequestTO;
import org.kollapp.organization.application.model.Activity;

@Mapper(componentModel = "spring", uses = PostingMapper.class)
public interface ActivityMapper {
    ActivityTO activityToActivityTO(Activity activity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    @Mapping(target = "activityPostings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Activity activityCreationRequestTOToActivity(ActivityCreationRequestTO activityCreationRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    @Mapping(target = "activityPostings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Activity activityUpdateTOToActivity(ActivityUpdateRequestTO activityUpdateRequestTO);
}
