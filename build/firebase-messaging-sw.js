importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyAVvIoy7rFv9X1-I2V6EnOwD92fJ6vclHo",
  authDomain: "social-noftication.firebaseapp.com",
  projectId: "social-noftication",
  storageBucket: "social-noftication.appspot.com",
  messagingSenderId: "76994253192",
  appId: "1:76994253192:web:e55ffeaf85fe3fb3c1ea3d"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
