package org.kollappbackend.user.application.publisher;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.kollappbackend.user.application.model.KollappUserDeletedEvent;
import org.springframework.stereotype.Service;

@SecondaryPort
@Service
public interface KollappUserPublisher {
    void publishUserDeletedEvent(KollappUserDeletedEvent kollappUserDeletedEvent);
}
