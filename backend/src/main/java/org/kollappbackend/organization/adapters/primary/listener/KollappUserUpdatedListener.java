package org.kollappbackend.organization.adapters.primary.listener;

import org.kollappbackend.user.application.model.KollappUserUpdatedEvent;
import org.springframework.context.ApplicationListener;

public class KollappUserUpdatedListener implements ApplicationListener<KollappUserUpdatedEvent> {
    @Override
    public void onApplicationEvent(KollappUserUpdatedEvent event) {

    }
}
