package com.none.kollappbackend.organization.application.service;

import com.none.kollappbackend.organization.application.MailSender;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private MailSender emailSender;

    private final String from = "noreply@kollapp.com";

    public void sendConfirmationMail(String recipientMail, String confirmationUrl) {
        String text = "Vielen Dank für die Registrierung. Bitte klicke auf den untenstehenden Link, um die Registrierung abzuschließen.\n\n\n";
        String emailTextBody = text + confirmationUrl;
        String subject = "Deine Registrierung.";
        log.info("Would have sent email with following confirmation url: {}", confirmationUrl);
        //emailSender.sendMail(from, recipientMail, subject, emailTextBody);
    }

    public void sendForgotPasswordMail(String recipientMail, String tempPassword){
        String text = "Hallo, \n Du hast kürzlich dein Passwort in der Orga-App Anwendung zurückgesetzt.\n\n";
        String text2 = "Dein neues Passwort lautet: " + tempPassword + "\n\n";
        String text3 = "Bitte ändere dein Passwort, wenn du dich das nächste Mal einloggst.";
        String emailTextBody = text + text2 + text3;
        String subject = "Dein neues Passwort: ";
        log.info("Would have reset the password to: {}", tempPassword);
        //emailSender.sendMail(from, recipientMail, subject, emailTextBody);
    }
}
