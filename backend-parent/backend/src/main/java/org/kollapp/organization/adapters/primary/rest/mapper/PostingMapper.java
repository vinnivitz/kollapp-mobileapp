package org.kollapp.organization.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.kollapp.organization.adapters.primary.rest.dto.ActivityBudgetCreateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityBudgetTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityBudgetUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PostingCreateUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.PostingTO;
import org.kollapp.organization.application.model.ActivityBudget;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;

@Mapper(componentModel = "spring")
public interface PostingMapper {

    PostingTO mapPostingToPostingTO(Posting posting);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    OrganizationPosting mapPostingTOToOrganizationPosting(PostingCreateUpdateRequestTO postingCreateUpdateRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activity", ignore = true)
    ActivityPosting mapPostingTOToActivityPosting(PostingCreateUpdateRequestTO postingCreateUpdateRequestTO);

    ActivityBudget mapActivityBudgetCreationRequestTOToActivityBudget(
            ActivityBudgetCreateRequestTO activityBudgetCreateRequestTO);

    ActivityBudget mapActivityBudgetUpdateRequestTOToActivityBudget(
            ActivityBudgetUpdateRequestTO activityBudgetUpdateRequestTO);

    ActivityBudgetTO mapActivityBudgetToActivityBudgetTO(ActivityBudget activityBudget);
}
