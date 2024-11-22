package com.none.orgaappbackend.organization.application;

public interface MailSender {

    void sendMail(String from, String to, String subject, String mailBody);
}
