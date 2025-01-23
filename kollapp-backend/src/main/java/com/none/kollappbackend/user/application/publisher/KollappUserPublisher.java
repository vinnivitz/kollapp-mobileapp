package com.none.kollappbackend.user.application.publisher;

import com.none.kollappbackend.user.application.model.KollappUserDeletedEvent;
import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.springframework.stereotype.Service;

@SecondaryPort
@Service
public interface KollappUserPublisher {
    void publishUserDeletedEvent(KollappUserDeletedEvent kollappUserDeletedEvent);
}
