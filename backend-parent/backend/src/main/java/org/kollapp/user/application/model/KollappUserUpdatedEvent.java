package org.kollapp.user.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

@Getter
@Setter
public class KollappUserUpdatedEvent extends ApplicationEvent {

    private String username;
    private long userId;

    public KollappUserUpdatedEvent(Object source, String username, long userId) {
        super(source);
        this.username = username;
        this.userId = userId;
    }
}
