package com.none.kollappbackend.user.application.service;

import org.jmolecules.architecture.hexagonal.SecondaryPort;

@SecondaryPort
public interface EmailService {
    void sendConfirmationMail(String recipientMail, String confirmationUrl);
    void sendForgotPasswordMail(String recipientMail, String resetUrl);
}
