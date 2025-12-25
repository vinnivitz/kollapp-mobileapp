package org.kollapp.user.adapters.secondary.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.config.properties.ApplicationProperties;
import org.kollapp.core.util.UrlBuilderUtil;
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
        String subject = messageUtil.getMessage("mail.confirmation.subject");

        Context context = new Context();
        context.setVariable("title", messageUtil.getMessage("mail.confirmation.title"));
        context.setVariable("text", messageUtil.getMessage("mail.confirmation.text"));
        context.setVariable("confirmationUrl", confirmationUrl);
        context.setVariable("button", messageUtil.getMessage("mail.confirmation.button"));
        context.setVariable("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));

        String htmlContent = templateEngine.process("confirmation", context);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@" + applicationProperties.getDomain());
            helper.setTo(recipientMail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Confirmation email sent to: " + recipientMail);

        } catch (MessagingException e) {
            log.error("Failed to send confirmation email to: " + recipientMail + " " + e);
        }
    }

    @Override
    public void sendNewEmailConfirmationMail(String recipientMail, String confirmationUrl) {
        String subject = messageUtil.getMessage("mail.new-email-confirmation.subject");

        Context context = new Context();
        context.setVariable("title", messageUtil.getMessage("mail.new-email-confirmation.title"));
        context.setVariable("text", messageUtil.getMessage("mail.new-email-confirmation.text"));
        context.setVariable("confirmationUrl", confirmationUrl);
        context.setVariable("button", messageUtil.getMessage("mail.new-email-confirmation.button"));
        context.setVariable("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));

        String htmlContent = templateEngine.process("confirm-new-email", context);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@" + applicationProperties.getDomain());
            helper.setTo(recipientMail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("New email confirmation email sent to: " + recipientMail);

        } catch (MessagingException e) {
            log.error("Failed to send new email confirmation email to: " + recipientMail + " " + e);
        }
    }

    @Override
    public void sendForgotPasswordMail(String recipientMail, String resetPasswordUrl) {
        String subject = messageUtil.getMessage("mail.forgot-password.subject");

        Context context = new Context();
        context.setVariable("title", messageUtil.getMessage("mail.forgot-password.title"));
        context.setVariable("text", messageUtil.getMessage("mail.forgot-password.text"));
        context.setVariable("resetPasswordUrl", resetPasswordUrl);
        context.setVariable("button", messageUtil.getMessage("mail.forgot-password.button"));
        context.setVariable("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));

        String htmlContent = templateEngine.process("forgot-password", context);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@" + applicationProperties.getDomain());
            helper.setTo(recipientMail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Forgot password email sent to: " + recipientMail);

        } catch (MessagingException e) {
            log.error("Failed to send forgot password email to: " + recipientMail + " " + e);
        }
    }
}
