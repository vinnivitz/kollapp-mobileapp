package com.none.orgaappbackend.organization.application;

import org.jmolecules.architecture.hexagonal.SecondaryPort;

@SecondaryPort
public interface MailSender {

    void sendMail(String from, String to, String subject, String mailBody);
}
