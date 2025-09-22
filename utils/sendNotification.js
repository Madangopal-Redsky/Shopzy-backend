const admin = require('../firebase');

async function sendNotification(fcmToken, title, body, data = {}) {
  if (!fcmToken) return;

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data, 
  };

  try {
    await admin.messaging().send(message);
    console.log("Notification sent to", fcmToken);
  } catch (err) {
    console.error("Error sending notification:", err.message);
  }
}

module.exports = sendNotification;
