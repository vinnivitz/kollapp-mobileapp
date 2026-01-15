package org.kollapp.user.adapters.secondary.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.config.properties.ApplicationProperties;
import org.kollapp.core.util.UrlBuilderUtil;
import org.kollapp.user.application.exception.MailCouldNotBeSentException;
import org.kollapp.user.application.service.EmailService;

@Service
@SecondaryAdapter
@Slf4j
public class EmailServiceImpl implements EmailService {
    @Autowired
    private UrlBuilderUtil urlBuilderUtil;

    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private MessageUtil messageUtil;

    @Override
    public void sendConfirmationMail(String recipientMail, String confirmationUrl) {
        sendTemplatedEmail(recipientMail, "mail.confirmation", "confirmation", "confirmationUrl", confirmationUrl);
    }

    @Override
    public void sendNewEmailConfirmationMail(String recipientMail, String confirmationUrl) {
        sendTemplatedEmail(
                recipientMail, "mail.new-email-confirmation", "confirm-new-email", "confirmationUrl", confirmationUrl);
    }

    @Override
    public void sendForgotPasswordMail(String recipientMail, String resetPasswordUrl) {
        sendTemplatedEmail(
                recipientMail, "mail.forgot-password", "forgot-password", "resetPasswordUrl", resetPasswordUrl);
    }

    private void sendTemplatedEmail(
            String recipientMail, String messageKeyPrefix, String templateName, String urlVariableName, String url) {
        String subject = messageUtil.getMessage(messageKeyPrefix + ".subject");

        Context context = new Context();
        context.setVariable("title", messageUtil.getMessage(messageKeyPrefix + ".title"));
        context.setVariable("text", messageUtil.getMessage(messageKeyPrefix + ".text"));
        context.setVariable(urlVariableName, url);
        context.setVariable("button", messageUtil.getMessage(messageKeyPrefix + ".button"));
        context.setVariable("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));

        String htmlContent = templateEngine.process(templateName, context);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@" + applicationProperties.getDomain());
            helper.setTo(recipientMail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException | MailException e) {
            throw new MailCouldNotBeSentException();
        }
    }
}
