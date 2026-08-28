import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);

export const db = (() => {
  try {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  } catch (e) {
    return getFirestore(app);
  }
})();

export const auth = getAuth(app);
export const storage = getStorage(app);
