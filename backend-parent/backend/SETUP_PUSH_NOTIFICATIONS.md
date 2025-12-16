# Push Notification Setup Guide

## Quick Start

This guide walks you through setting up push notifications for Kollapp.

## ✅ What's Already Done

The backend push notification module is now fully implemented with:

- ✅ Firebase Admin SDK dependency added to `pom.xml`
- ✅ Complete domain model (DeviceToken, PushNotification entities)
- ✅ Repository layer with JPA implementation
- ✅ Service layer with FCM integration
- ✅ REST API endpoints for device registration and notification sending
- ✅ Exception handling and error management
- ✅ Configuration properties and Firebase setup
- ✅ Internationalization (English & German)
- ✅ Automatic invalid token cleanup

## 🚀 Setup Steps

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Navigate to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate new private key**
5. Save the downloaded JSON file as `firebase-service-account.json`
6. Place it in: `backend/src/main/resources/firebase-service-account.json`

⚠️ **Important**: Add `firebase-service-account.json` to `.gitignore` (already done)

### 2. Configure Environment Variables

Add to your `backend/.env` file:

```env
# Enable Firebase
BACKEND_FIREBASE_ENABLED=true

# Path to credentials (relative to src/main/resources)
BACKEND_FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

### 3. Build the Project

```bash
cd backend-parent/backend
mvn clean install
```

This will:
- Download Firebase Admin SDK dependencies
- Generate MapStruct mappers
- Create database tables on startup

### 4. Database Tables

The following tables will be created automatically via JPA:

- `device_token` - Stores FCM device tokens for users
- `push_notification` - Logs all sent notifications

## 📱 Mobile App Integration

Your mobile app already has the client-side setup. Now connect it to the backend:

### Update the Registration Handler

In `mobileapp/src/lib/utility/push-notifications.utility.ts`:

```typescript
import { api } from '$lib/api'; // Your API client

export async function initPushNotifications(): Promise<void> {
    try {
        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted') {
            await PushNotifications.register();
        }

        PushNotifications.addListener('registration', async (token: Token) => {
            // Register token with backend
            try {
                await api.post('/api/notifications/device-token', {
                    token: token.value,
                    deviceType: 'ANDROID' // or 'IOS' based on platform
                });
                console.log('Device token registered with backend');
            } catch (error) {
                console.error('Failed to register device token:', error);
            }
        });

        PushNotifications.addListener('registrationError', async (error: RegistrationError) => {
            console.error('Push notification registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
            await showAlert(notification.title + ': ' + notification.body, { type: AlertType.INFO });
        });

        PushNotifications.addListener('pushNotificationActionPerformed', async (notification: ActionPerformed) => {
            // Handle notification tap
            const data = notification.notification.data;
            
            // Route based on notification type
            if (data.type === 'activity_created') {
                // Navigate to activity details
                window.location.href = `/organization/${data.organizationId}/activities`;
            } else if (data.type === 'organization_invitation') {
                // Navigate to organization
                window.location.href = `/organization/${data.organizationId}`;
            }
        });
    } catch {
        console.info('Push notifications not supported on this platform');
    }
}
```

## 🧪 Testing

### 1. Test Without Firebase (Development)

For local development without Firebase:

```env
BACKEND_FIREBASE_ENABLED=false
```

The app will run normally but won't send actual push notifications.

### 2. Test With Firebase

1. Ensure Firebase is configured (`BACKEND_FIREBASE_ENABLED=true`)
2. Start the backend: `mvn spring-boot:run`
3. Authenticate via your app/API
4. Send a test notification:

```bash
curl -X POST http://localhost:8080/api/notifications/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "Hello from Kollapp!",
    "data": {
      "type": "test"
    }
  }'
```

## 📋 API Endpoints

All endpoints require JWT authentication:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/device-token` | Register FCM device token |
| DELETE | `/api/notifications/device-token?token=XXX` | Unregister device token |
| GET | `/api/notifications/device-tokens` | Get user's device tokens |
| POST | `/api/notifications/send` | Send notification to self (testing) |
| POST | `/api/notifications/send-to-users` | Send to multiple users (admin) |

## 🔧 Integration with Existing Features

Example integration in your service:

```java
@Service
public class ActivityService {
    @Autowired
    private PushNotificationService pushNotificationService;
    
    public Activity createActivity(ActivityDTO activityDTO) {
        Activity activity = // ... create activity
        
        // Send notifications to organization members
        List<Long> memberIds = getOrganizationMemberIds(activity.getOrganizationId());
        
        Map<String, String> data = new HashMap<>();
        data.put("type", "activity_created");
        data.put("activityId", String.valueOf(activity.getId()));
        data.put("organizationId", String.valueOf(activity.getOrganizationId()));
        
        pushNotificationService.sendNotificationToUsers(
            memberIds,
            "New Activity",
            "A new activity '" + activity.getName() + "' has been created",
            data
        );
        
        return activity;
    }
}
```

### Common Notification Scenarios

#### 1. Activity Created
```java
Map<String, String> data = new HashMap<>();
data.put("type", "activity_created");
data.put("activityId", String.valueOf(activityId));
data.put("organizationId", String.valueOf(organizationId));

pushNotificationService.sendNotificationToUsers(
    memberIds,
    "New Activity",
    activityName + " has been scheduled",
    data
);
```

#### 2. Organization Invitation
```java
Map<String, String> data = new HashMap<>();
data.put("type", "organization_invitation");
data.put("organizationId", String.valueOf(organizationId));

pushNotificationService.sendNotificationToUser(
    userId,
    "Organization Invitation",
    "You've been invited to " + organizationName,
    data
);
```

#### 3. Membership Approved
```java
Map<String, String> data = new HashMap<>();
data.put("type", "membership_approved");
data.put("organizationId", String.valueOf(organizationId));

pushNotificationService.sendNotificationToUser(
    userId,
    "Membership Approved",
    "Your membership to " + organizationName + " has been approved",
    data
);
```

#### 4. Budget Posting Created
```java
Map<String, String> data = new HashMap<>();
data.put("type", "posting_created");
data.put("postingId", String.valueOf(postingId));
data.put("organizationId", String.valueOf(organizationId));

pushNotificationService.sendNotificationToUsers(
    managerIds,
    "New Posting",
    "A new posting of " + amount + " has been created",
    data
);
```

## 🔒 Security Notes

- Device tokens are user-specific (tied to user ID)
- Users can only register/unregister their own tokens
- All endpoints require authentication
- Invalid/expired tokens are automatically deactivated
- Firebase credentials should never be committed to version control

## 📚 Additional Documentation

- Full module documentation: `PUSH_NOTIFICATIONS.md`
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- FCM Architecture: https://firebase.google.com/docs/cloud-messaging

## ❓ Troubleshooting

### "Firebase not initialized"
- Check that `firebase-service-account.json` exists in `src/main/resources/`
- Verify `BACKEND_FIREBASE_ENABLED=true` in your `.env`
- Check application logs for Firebase initialization errors

### "Device token not registered"
- Ensure mobile app calls `/api/notifications/device-token` after getting FCM token
- Check that user is authenticated before registration
- Verify token format is correct (FCM tokens are long strings)

### "Notifications not received on mobile"
- Check that FCM project matches the one in `google-services.json`
- Verify app package name matches Firebase configuration
- Test with `/api/notifications/send` endpoint first
- Check mobile app has notification permissions

### "FirebaseMessaging bean not found"
- Ensure `BACKEND_FIREBASE_ENABLED=true`
- Check Firebase credentials file path is correct
- Verify Firebase Admin SDK dependency is in pom.xml

## 🎉 Next Steps

1. Set up Firebase project and download credentials
2. Update `.env` with Firebase settings
3. Update mobile app to register device tokens
4. Integrate notifications into your business logic
5. Test end-to-end notification flow

Happy coding! 🚀
