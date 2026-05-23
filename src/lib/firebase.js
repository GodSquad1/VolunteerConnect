import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAqBlEfeDDpk8Qp4Dx8w6vPTAr2FfmPGpk',
  authDomain: 'volunteerconnect-1f001.firebaseapp.com',
  projectId: 'volunteerconnect-1f001',
  storageBucket: 'volunteerconnect-1f001.firebasestorage.app',
  messagingSenderId: '128566178372',
  appId: '1:128566178372:web:2efe37117b9e97caaf0211',
  measurementId: 'G-M24M4SW7LB',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
};
