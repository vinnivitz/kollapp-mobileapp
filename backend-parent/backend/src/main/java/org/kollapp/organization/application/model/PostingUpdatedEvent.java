package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;
import org.springframework.lang.Nullable;

/**
 * Event that is fired when a posting is updated.
 */
@Getter
@Setter
public class PostingUpdatedEvent extends ApplicationEvent {
    private long postingId;
    private Long activityId; // null for organization postings
    private long organizationId;
    private String postingPurpose;

    public PostingUpdatedEvent(
            Object source, long postingId, @Nullable Long activityId, long organizationId, String postingPurpose) {
        super(source);
        this.postingId = postingId;
        this.activityId = activityId;
        this.organizationId = organizationId;
        this.postingPurpose = postingPurpose;
    }
}
