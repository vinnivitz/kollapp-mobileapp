package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event that is fired when a posting is deleted.
 */
@Getter
@Setter
public class PostingDeletedEvent extends ApplicationEvent {
    private long postingId;
    private Long activityId;
    private long organizationId;
    private String postingPurpose;

    public PostingDeletedEvent(
            Object source, long postingId, Long activityId, long organizationId, String postingPurpose) {
        super(source);
        this.postingId = postingId;
        this.activityId = activityId;
        this.organizationId = organizationId;
        this.postingPurpose = postingPurpose;
    }
}
