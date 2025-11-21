package org.kollapp.user.application.publisher;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.springframework.stereotype.Service;

import org.kollapp.user.application.model.KollappUserDeletedEvent;
import org.kollapp.user.application.model.KollappUserUpdatedEvent;

@SecondaryPort
@Service
public interface KollappUserPublisher {
    void publishUserDeletedEvent(KollappUserDeletedEvent kollappUserDeletedEvent);

    void publishUserUpdatedEvent(KollappUserUpdatedEvent kollappUserUpdatedEvent);
}
