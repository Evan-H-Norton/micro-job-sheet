import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCC5oqdf7FBJdHgZcOZb3LzMPdoih3hzng",
  authDomain: "micro-job-sheet.firebaseapp.com",
  projectId: "micro-job-sheet",
  storageBucket: "micro-job-sheet.appspot.com",
  messagingSenderId: "671576539855",
  appId: "1:671576539855:web:a58a359d782218ae4cedba"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
