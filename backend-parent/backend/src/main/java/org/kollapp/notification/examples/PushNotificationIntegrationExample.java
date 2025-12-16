package org.kollapp.notification.examples;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import org.kollapp.notification.application.service.PushNotificationService;

/**
 * Example integration showing how to use the PushNotificationService in your application.
 * This is for demonstration purposes - delete or adapt for your needs.
 */
@Slf4j
@Component
public class PushNotificationIntegrationExample {
    @Autowired
    private PushNotificationService pushNotificationService;

    /**
     * Example: Send notification when a new activity is created in an organization.
     */
    public void onActivityCreated(Long organizationId, String activityName, List<Long> memberUserIds) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "activity_created");
        data.put("organizationId", String.valueOf(organizationId));
        data.put("activityName", activityName);

        pushNotificationService.sendNotificationToUsers(
                memberUserIds, "New Activity", "A new activity '" + activityName + "' has been created", data);

        log.info("Sent activity creation notification to {} users", memberUserIds.size());
    }

    /**
     * Example: Send notification when a user is invited to an organization.
     */
    public void onOrganizationInvitation(Long userId, String organizationName, Long organizationId) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "organization_invitation");
        data.put("organizationId", String.valueOf(organizationId));

        pushNotificationService.sendNotificationToUser(
                userId, "Organization Invitation", "You've been invited to join " + organizationName, data);

        log.info("Sent organization invitation notification to user {}", userId);
    }

    /**
     * Example: Send notification when a posting is created.
     */
    public void onPostingCreated(Long userId, String organizationName, Double amount) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "posting_created");
        data.put("amount", String.valueOf(amount));

        pushNotificationService.sendNotificationToUser(
                userId,
                "New Posting",
                String.format("A new posting of %.2f has been added to %s", amount, organizationName),
                data);

        log.info("Sent posting creation notification to user {}", userId);
    }

    /**
     * Example: Send notification when user's membership is approved.
     */
    public void onMembershipApproved(Long userId, String organizationName) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "membership_approved");

        pushNotificationService.sendNotificationToUser(
                userId, "Membership Approved", "Your membership to " + organizationName + " has been approved!", data);

        log.info("Sent membership approval notification to user {}", userId);
    }

    /**
     * Example: Broadcast announcement to all organization members.
     */
    public void sendOrganizationAnnouncement(String organizationName, String message, List<Long> memberUserIds) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "announcement");

        pushNotificationService.sendNotificationToUsers(
                memberUserIds, organizationName + " Announcement", message, data);

        log.info("Sent announcement to {} members of {}", memberUserIds.size(), organizationName);
    }
}
