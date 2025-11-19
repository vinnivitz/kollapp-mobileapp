package org.kollappbackend.user.application.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Getter
@Setter
public class KollappUserDeletedEvent extends ApplicationEvent {

    private long userId;

    public KollappUserDeletedEvent(Object source, long userId) {
        super(source);
        this.userId = userId;
    }
}
