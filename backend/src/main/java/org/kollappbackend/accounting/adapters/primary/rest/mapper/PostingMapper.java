package org.kollappbackend.accounting.adapters.primary.rest.mapper;

import org.kollappbackend.accounting.adapters.primary.rest.model.PostingTO;
import org.kollappbackend.accounting.application.model.ActivityPosting;
import org.kollappbackend.accounting.application.model.OrganizationPosting;
import org.kollappbackend.accounting.application.model.Posting;
import org.mapstruct.Mapper;
import org.mapstruct.SubclassMapping;

@Mapper(componentModel = "spring")
public interface PostingMapper {

    @SubclassMapping(source = ActivityPosting.class, target = PostingTO.class)
    @SubclassMapping(source = OrganizationPosting.class, target = PostingTO.class)
    PostingTO mapPostingToPostingTO(Posting posting);

    ActivityPosting mapPostingTOToActivityPosting(PostingTO postingTO);

    OrganizationPosting mapPostingTOToOrganizationPosting(PostingTO postingTO);
}
