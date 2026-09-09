const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure Email Transporter (e.g., SendGrid, Gmail SMTP, or Mailgun)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.onSessionBroadcast = functions.firestore
  .document('program_sessions/{sessionId}')
  .onWrite(async (change, context) => {
    const newData = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;

    if (!newData) return null; // Deleted document

    // Check if broadcastNote exists and was updated/added
    const hasNewNote = newData.broadcastNote && 
      (!previousData || previousData.broadcastNote !== newData.broadcastNote);

    if (!hasNewNote) return null;

    const payload = {
      notification: {
        title: `📢 Schedule Update: ${newData.title}`,
        body: `${newData.broadcastNote} (${newData.time} at ${newData.location})`,
      },
      data: {
        sessionId: context.params.sessionId,
        type: 'AGENDA_BROADCAST',
      },
    };

    try {
      // 1. Send FCM Push Notification to the 'delegates' topic
      const fcmResponse = await admin.messaging().sendToTopic('delegates', payload);
      console.log('FCM Broadcast sent successfully:', fcmResponse);

      // 2. Fetch Delegate Emails for Email Alert (Optional batch broadcast)
      const delegatesSnapshot = await admin.firestore().collection('users')
        .where('role', '==', 'DELEGATE')
        .get();

      const recipientEmails = delegatesSnapshot.docs
        .map(doc => doc.data().email)
        .filter(Boolean);

      if (recipientEmails.length > 0) {
        const mailOptions = {
          from: '"Conference Steering Committee" <no-reply@conference.org>',
          bcc: recipientEmails, // Use BCC for mass mailing privacy
          subject: `Urgent Program Update: ${newData.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0284c7;">Schedule Announcement</h2>
              <p><strong>Session:</strong> ${newData.title}</p>
              <p><strong>Time:</strong> ${newData.time}</p>
              <p><strong>Location:</strong> ${newData.location}</p>
              <div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; color: #92400e;">
                <strong>Notice:</strong> ${newData.broadcastNote}
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email broadcast sent to ${recipientEmails.length} delegates.`);
      }
    } catch (error) {
      console.error('Error broadcasting update:', error);
    }
  });