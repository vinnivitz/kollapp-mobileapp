package org.kollapp.user.adapters.primary.view;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.config.TemplateView;
import org.kollapp.core.util.UrlBuilderUtil;
import org.kollapp.user.application.service.KollappUserService;

@Controller
@RequestMapping("/api/public/user")
@Slf4j
@PrimaryAdapter
public class UnauthorizedKollappUserViewController {

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private UrlBuilderUtil urlBuilderUtil;

    @Autowired
    private MessageUtil messageUtil;

    @GetMapping(value = "/confirmation", produces = MediaType.TEXT_HTML_VALUE)
    public String confirmKollappUser(@RequestParam("confirmationToken") String confirmationToken, Model model) {
        kollappUserService.activateKollappUser(confirmationToken);

        model.addAttribute("title", messageUtil.getMessage("view.account-confirmed.title"));
        model.addAttribute("header", messageUtil.getMessage("view.account-confirmed.header"));
        model.addAttribute("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));
        model.addAttribute("text", messageUtil.getMessage("view.account-confirmed.text"));
        model.addAttribute("downloadAppUrl", "https://kollapp.org");
        model.addAttribute("button", messageUtil.getMessage("view.account-confirmed.button"));

        return TemplateView.ACCOUNT_CONFIRMED.getViewName();
    }

    @GetMapping(value = "/confirm-new-email", produces = MediaType.TEXT_HTML_VALUE)
    public String confirmNewEmail(@RequestParam("confirmationToken") String confirmationToken, Model model) {
        kollappUserService.confirmNewEmail(confirmationToken);

        model.addAttribute("title", messageUtil.getMessage("view.new-email-confirmed.title"));
        model.addAttribute("header", messageUtil.getMessage("view.new-email-confirmed.header"));
        model.addAttribute("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));
        model.addAttribute("text", messageUtil.getMessage("view.new-email-confirmed.text"));
        model.addAttribute("downloadAppUrl", "https://kollapp.org");
        model.addAttribute("button", messageUtil.getMessage("view.new-email-confirmed.button"));

        return TemplateView.ACCOUNT_CONFIRMED.getViewName();
    }
}
