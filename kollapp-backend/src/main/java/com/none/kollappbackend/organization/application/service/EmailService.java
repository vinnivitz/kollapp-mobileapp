package com.none.kollappbackend.organization.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.jmolecules.architecture.hexagonal.SecondaryPort;

@SecondaryPort
public interface EmailService {
    public void sendConfirmationMail(String recipientMail, String confirmationUrl);
    public void sendForgotPasswordMail(String recipientMail, String resetUrl);
}
