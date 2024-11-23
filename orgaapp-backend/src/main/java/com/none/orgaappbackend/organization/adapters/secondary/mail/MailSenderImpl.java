package com.none.orgaappbackend.organization.adapters.secondary.mail;

import com.none.orgaappbackend.organization.application.MailSender;
import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@SecondaryAdapter
public class MailSenderImpl implements MailSender {

    @Autowired
    private JavaMailSender mailSender;

    public void sendMail(String from, String to, String subject, String mailBody) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(mailBody);
        mailSender.send(message);
    }

}
