package com.none.orgaappbackend.user.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private UserServiceImpl userServiceImpl;

    public void sendConfirmationMail(String recipientMail, String confirmationUrl) {
        String text = "Vielen Dank für die Registrierung. Bitte klicke auf den untenstehenden Link, um die Registrierung abzuschließen.\n\n\n";
        String emailTextBody = text + confirmationUrl;
        String subject = "Deine Registrierung.";
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@orgaapp.com");
        message.setTo(recipientMail);
        message.setSubject(subject);
        message.setText(emailTextBody);
        emailSender.send(message);
    }

    public void sendForgotPasswordMail(String recipientMail, String encodedTempPassword){
        String text = "Hallo, \n Du hast kürzlich dein Passwort in der Orga-App Anwendung zurückgesetzt.\n\n";
        String text2 = "Dein neues Passwort lautet: " + encodedTempPassword + "\n\n";
        String text3 = "Bitte ändere dein Passwort, wenn du dich das nächste Mal einloggst.";
        String emailTextBody = text + text2 + text3;
        String subject = "Dein neues Passwort: ";
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@orgaapp.com");
        message.setTo(recipientMail);
        message.setSubject(subject);
        message.setText(emailTextBody);
        emailSender.send(message);
    }
}
