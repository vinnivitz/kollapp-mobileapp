package com.none.kollappbackend.organization.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
public interface EmailService {
    public void sendConfirmationMail(String recipientMail, String confirmationUrl);
}
