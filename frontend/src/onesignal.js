// Notification Service for FinWeave
// This file handles OneSignal push notification initialization and management

// Initialize OneSignal
export const initializeOneSignal = async () => {
  if (!window.OneSignal) {
    console.log('OneSignal SDK not loaded');
    return null;
  }

  try {
    await window.OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID",
      allowLocalhostAsSecureOrigin: true,
      welcomeNotification: {
        disable: true
      }
    });
    
    console.log('OneSignal initialized successfully');
    return window.OneSignal;
  } catch (error) {
    console.error('Error initializing OneSignal:', error);
    return null;
  }
};

// Get OneSignal Player ID
export const getOneSignalPlayerId = async () => {
  if (!window.OneSignal) {
    return null;
  }
  
  try {
    const state = await window.OneSignal.getPermissionSubscriptionState();
    if (state && state.subscription && state.subscription.userId) {
      return state.subscription.userId;
    }
  } catch (error) {
    console.error('Error getting OneSignal player ID:', error);
  }
  return null;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!window.OneSignal) {
    console.log('OneSignal not available');
    return 'unavailable';
  }

  try {
    const result = await window.OneSignal.registerForPushNotifications();
    return result;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'error';
  }
};

// Send notification to specific user
export const sendNotificationToUser = async (playerId, title, message, url) => {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId,
        title,
        message,
        url
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

