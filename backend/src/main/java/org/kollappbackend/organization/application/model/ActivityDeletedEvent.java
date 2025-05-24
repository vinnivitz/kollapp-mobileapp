package org.kollappbackend.organization.application.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Getter
@Setter
public class ActivityDeletedEvent extends ApplicationEvent {
    private long activityId;

    public ActivityDeletedEvent(Object source, long activityId) {
        super(source);
        this.activityId = activityId;
    }
}
