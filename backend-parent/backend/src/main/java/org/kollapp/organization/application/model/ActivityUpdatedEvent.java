package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event that is fired when an activity is updated in an organization.
 */
@Getter
@Setter
public class ActivityUpdatedEvent extends ApplicationEvent {
    private long activityId;
    private long organizationId;
    private String activityName;

    public ActivityUpdatedEvent(Object source, long activityId, long organizationId, String activityName) {
        super(source);
        this.activityId = activityId;
        this.organizationId = organizationId;
        this.activityName = activityName;
    }
}
