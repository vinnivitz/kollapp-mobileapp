package org.kollapp.notification.adapters.primary.rest.dto.enums;

/**
 * Transfer object enum representing different types of push notifications.
 */
public enum NotificationType {
    /**
     * General notifications that do not fit into other categories.
     * Examples: welcome messages, periodic summaries.
     * User decision: "Do I want to receive general notifications?"
     */
    GENERAL,
    /**
     * Notifications about your membership status in organizations.
     * Examples: membership approved/rejected, role changed to manager, removed from organization.
     * User decision: "Do I want to know about changes to my membership status?"
     */
    MEMBERSHIP_STATUS,

    /**
     * Notifications about new members joining your organization or pending member requests.
     * Examples: new member joined, member requests approval (for managers).
     * User decision: "Do I want to know when people join or want to join my organization?"
     */
    MEMBERSHIP_CHANGES,

    /**
     * Notifications about activities/events in your organizations.
     * Examples: new activity created, activity updated/deleted, activity reminder.
     * User decision: "Do I want to be notified about events and activities?"
     */
    ACTIVITIES,

    /**
     * Notifications about financial postings and budget changes.
     * Examples: new posting added, expense recorded, budget threshold reached.
     * User decision: "Do I want to know about financial transactions?"
     */
    FINANCES,

    /**
     * Notifications about organization-wide announcements and updates.
     * Examples: organization description changed, new feature announcement.
     * User decision: "Do I want to receive general organization announcements?"
     */
    ANNOUNCEMENTS,

    /**
     * Direct messages and mentions (future feature).
     * Examples: someone mentioned you, direct message received.
     * User decision: "Do I want to receive direct messages?" (usually always on)
     */
    MESSAGES,

    /**
     * Critical system notifications and security alerts.
     * Examples: account security issues, system maintenance, urgent technical problems.
     * User decision: "Do I want critical system notifications?" (usually always on)
     */
    SYSTEM_ALERTS
}
