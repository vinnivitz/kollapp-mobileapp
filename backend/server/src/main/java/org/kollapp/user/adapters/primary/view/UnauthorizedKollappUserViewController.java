package org.kollapp.user.adapters.primary.view;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
    private MessageSource messageSource;

    @GetMapping(value = "/confirmation", produces = MediaType.TEXT_HTML_VALUE)
    public String confirmKollappUser(@RequestParam("confirmationToken") String confirmationToken, Model model) {
        kollappUserService.activateKollappUser(confirmationToken);

        model.addAttribute("title", messageSource.getMessage("view.account-confirmed.title", null, null));
        model.addAttribute("header", messageSource.getMessage("view.account-confirmed.header", null, null));
        model.addAttribute("logoUrl", urlBuilderUtil.buildServerUrl("/logo.png"));
        model.addAttribute("text", messageSource.getMessage("view.account-confirmed.text", null, null));
        model.addAttribute("downloadAppUrl", "https://kollapp.org");
        model.addAttribute("button", messageSource.getMessage("view.account-confirmed.button", null, null));

        return TemplateView.ACCOUNT_CONFIRMED.getViewName();
    }
}
