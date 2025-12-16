package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event that is fired when a new activity is created in an organization.
 */
@Getter
@Setter
public class ActivityCreatedEvent extends ApplicationEvent {
    private long activityId;
    private long organizationId;
    private String activityName;

    public ActivityCreatedEvent(Object source, long activityId, long organizationId, String activityName) {
        super(source);
        this.activityId = activityId;
        this.organizationId = organizationId;
        this.activityName = activityName;
    }
}
