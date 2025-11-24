package org.kollapp.user.adapters.secondary.publisher;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import org.kollapp.user.application.model.KollappUserDeletedEvent;
import org.kollapp.user.application.model.KollappUserUpdatedEvent;
import org.kollapp.user.application.publisher.KollappUserPublisher;

@SecondaryAdapter
@Service
@Slf4j
public class KollappUserPublisherImpl implements KollappUserPublisher {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publishUserDeletedEvent(KollappUserDeletedEvent kollappUserDeletedEvent) {
        log.info("[User] Publishing domain event: UserDeletedEvent");
        applicationEventPublisher.publishEvent(kollappUserDeletedEvent);
    }

    @Override
    public void publishUserUpdatedEvent(KollappUserUpdatedEvent kollappUserUpdatedEvent) {
        log.info("[User] Publishing domain event: UserUpdatedEvent");
        applicationEventPublisher.publishEvent(kollappUserUpdatedEvent);
    }
}
