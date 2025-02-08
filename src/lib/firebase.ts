import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAEd2vE96RSyfxXK8ERV8DTNp2z4QnuGrA",
  authDomain: "datanikah-6cbf8.firebaseapp.com",
  projectId: "datanikah-6cbf8",
  storageBucket: "datanikah-6cbf8.firebasestorage.app",
  messagingSenderId: "396968044614",
  appId: "1:396968044614:web:3036e62c315f080e53c247",
  measurementId: "G-351N4BXS4S"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
