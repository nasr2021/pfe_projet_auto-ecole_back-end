// src/firebase-admin.ts
import * as admin from 'firebase-admin';
import * as serviceAccount from './config/autoecole-23d79-firebase-adminsdk-l72oa-150de6bd44.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://autoecole-23d79.firebaseio.com'
});

export default admin;
