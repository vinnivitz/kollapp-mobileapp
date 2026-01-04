package org.kollapp.user.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

@Getter
@Setter
public class KollappUserDeletedEvent extends ApplicationEvent {

    private long userId;
    private String username;

    public KollappUserDeletedEvent(Object source, long userId, String username) {
        super(source);
        this.userId = userId;
        this.username = username;
    }
}
