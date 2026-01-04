package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;
import org.springframework.lang.Nullable;

/**
 * Event that is fired when a new posting is created.
 */
@Getter
@Setter
public class PostingCreatedEvent extends ApplicationEvent {
    private long postingId;
    private Long activityId;
    private long organizationId;
    private String postingPurpose;

    public PostingCreatedEvent(
            Object source, long postingId, @Nullable Long activityId, long organizationId, String postingPurpose) {
        super(source);
        this.postingId = postingId;
        this.activityId = activityId;
        this.organizationId = organizationId;
        this.postingPurpose = postingPurpose;
    }
}
