package org.kollapp.notification.application.service;

/**
 * Utility class for building deep link routes for push notifications.
 * Centralizes route construction to ensure consistency across the application.
 */
public class NotificationRouteBuilder {

    private static final String ORGANIZATION_BASE = "/organization";

    /**
     * Build route to organization page.
     *
     * @return Deep link route
     */
    public String toOrganizationPage() {
        return ORGANIZATION_BASE;
    }

    /**
     * Build route to organization members page.
     *
     * @return Deep link route
     */
    public String toOrganizationMembers() {
        return this.toOrganizationPage() + "/members";
    }

    /**
     * Build route to organization activities page.
     *
     * @return Deep link route
     */
    public String toActivities() {
        return this.toOrganizationPage() + "/activities";
    }

    /**
     * Build route to specific activity page.
     *
     * @param activityId The activity ID
     * @return Deep link route
     */
    public String toActivity(long activityId) {
        return this.toActivities() + "/" + activityId;
    }

    /**
     * Build route to account page.
     *
     * @return Deep link route
     */
    public String toAccountPage() {
        return "/account";
    }

    /**
     * Build route to account notifications page.
     *
     * @return Deep link route
     */
    public String toAccountNotifications() {
        return this.toAccountPage() + "/notifications";
    }
}
