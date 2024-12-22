package com.none.kollappbackend.organization.application.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.none.kollappbackend.core.config.properties.ApplicationProperties;
import com.none.kollappbackend.organization.application.service.EmailService;
import com.none.kollappbackend.util.UrlBuilderUtil;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.MessagingException;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {
    @Autowired
    private UrlBuilderUtil urlBuilderUtil;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendConfirmationMail(String recipientMail, String confirmationUrl) {
        String subject = messageSource.getMessage("mail.confirmation.subject", null, LocaleContextHolder.getLocale());

        Context context = new Context();
        context.setVariable("title", messageSource.getMessage("mail.confirmation.title", null, LocaleContextHolder.getLocale()));
        context.setVariable("text", messageSource.getMessage("mail.confirmation.text", null, LocaleContextHolder.getLocale()));
        context.setVariable("confirmationUrl", confirmationUrl);
        context.setVariable("button", messageSource.getMessage("mail.confirmation.button", null, LocaleContextHolder.getLocale()));
        context.setVariable("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));

        String htmlContent = templateEngine.process("confirmation", context);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@" + applicationProperties.getHost());
            helper.setTo(recipientMail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Confirmation email sent to: " + recipientMail);

        } catch (MessagingException e) {
            log.error("Failed to send confirmation email to: " + recipientMail + " " + e);
        }
    }

    public void sendForgotPasswordMail(String recipientMail, String resetPasswordUrl) {
        String subject = messageSource.getMessage("mail.forgot-password.subject", null, LocaleContextHolder.getLocale());

        Context context = new Context();
        context.setVariable("title", messageSource.getMessage("mail.forgot-password.title", null, LocaleContextHolder.getLocale()));
        context.setVariable("text", messageSource.getMessage("mail.forgot-password.text", null, LocaleContextHolder.getLocale()));
        context.setVariable("resetPasswordUrl", resetPasswordUrl);
        context.setVariable("button", messageSource.getMessage("mail.forgot-password.button", null, LocaleContextHolder.getLocale()));
        context.setVariable("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));

        String htmlContent = templateEngine.process("forgot-password", context);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@" + applicationProperties.getHost());
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
