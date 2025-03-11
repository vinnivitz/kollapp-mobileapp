package com.none.kollappbackend.organization.adapters.primary.rest.mapper;

import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityCreationRequestTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityUpdateRequestTO;
import com.none.kollappbackend.organization.application.model.Activity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ActivityMapper {
    ActivityTO activityToActivityTO(Activity activity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    Activity activityCreationRequestTOToActivity(ActivityCreationRequestTO activityCreationRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    Activity activityUpdateTOToActivity(ActivityUpdateRequestTO activityUpdateRequestTO);
}
