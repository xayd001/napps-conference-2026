import QRCode from 'qrcode';
import { messaging, db, auth } from '../firebase';
import { getToken } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

/**
 * Requests browser permission for push notifications and obtains an FCM registration token.
 * Saves the token to the current authenticated user's Firestore document.
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_PUBLIC_VAPID_KEY' // Found in Firebase Console > Project Settings > Cloud Messaging
      });

      if (token && auth.currentUser) {
        // Save FCM token to the user's document for target notification routing
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token)
        });
      }

      console.log('FCM Token generated and saved:', token);
      return token;
    } else {
      console.warn('Notification permission denied by user.');
      return null;
    }
  } catch (error) {
    console.error('Error enabling notifications:', error);
    return null;
  }
};

/**
 * Generates a Data URL image string for a given QR token code.
 */
export const generateQRCodeDataUrl = async (token) => {
  try {
    return await QRCode.toDataURL(token, {
      width: 250,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return null;
  }
};

/**
 * Dispatches automated digital invitation via Email/SMS gateway.
 */
export const dispatchDigitalInvitation = async (stakeholder) => {
  try {
    const qrDataUrl = await generateQRCodeDataUrl(stakeholder.qrCodeToken);

    // Payload for Cloud Function or API endpoint (EmailJS / Twilio)
    const payload = {
      recipientName: stakeholder.name,
      recipientEmail: stakeholder.email || '',
      recipientPhone: stakeholder.phone,
      qrToken: stakeholder.qrCodeToken,
      qrCodeImage: qrDataUrl,
      eventTitle: 'NAPPSCONFERENCE2026',
      venue: 'Main Auditorium, Maiduguri, Borno State'
    };

    console.log('Dispatching digital invitation payload:', payload);

    // Simulated API response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true, message: 'Invitation email & SMS dispatched successfully.' };
  } catch (error) {
    console.error('Error dispatching digital invitation:', error);
    return { success: false, message: 'Failed to dispatch digital invitation.' };
  }
};