import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCUdC-ZXrw59BsXIzkPMW2e53y1n5bXOik",
  authDomain: "autoecole-23d79.firebaseapp.com",
  projectId: "autoecole-23d79",
  storageBucket: "autoecole-23d79.appspot.com",
  messagingSenderId: "146355821473",
  appId: "1:146355821473:web:34d960175398be0c29c9e0",
  measurementId: "G-RERERDFTFW"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const requestPermission = async () => {
  try {
    await Notification.requestPermission();
    const token = await getToken(messaging, { vapidKey: 'at-secret' });
    console.log('FCM Token:', token);
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
});

requestPermission();

export { messaging, requestPermission };
