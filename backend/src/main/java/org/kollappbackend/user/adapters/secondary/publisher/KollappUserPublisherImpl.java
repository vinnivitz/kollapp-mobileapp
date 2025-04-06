package org.kollappbackend.user.adapters.secondary.publisher;

import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.user.application.model.KollappUserDeletedEvent;
import org.kollappbackend.user.application.publisher.KollappUserPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

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
}
