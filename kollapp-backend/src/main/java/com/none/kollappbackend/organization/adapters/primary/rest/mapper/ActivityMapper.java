package com.none.kollappbackend.organization.adapters.primary.rest.mapper;

import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityCreationRequestTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityUpdateRequestTO;
import com.none.kollappbackend.organization.application.model.Activity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ActivityMapper {
    ActivityTO activityToActivityTO(Activity activity);
    Activity activityCreationRequestTOToActivity(ActivityCreationRequestTO activityCreationRequestTO);
    Activity activityUpdateTOToActivity(ActivityUpdateRequestTO activityUpdateRequestTO);
}
