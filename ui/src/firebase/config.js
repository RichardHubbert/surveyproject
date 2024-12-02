import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3a7QPTnbasyhivDKSOov-Qj3iccDom0k",
  authDomain: "surveyproject-803e9.firebaseapp.com",
  projectId: "surveyproject-803e9",
  storageBucket: "surveyproject-803e9.firebasestorage.app",
  messagingSenderId: "330389595114",
  appId: "1:330389595114:web:f8307f121a32314607c893",
  measurementId: "G-XFXVMYSQ0C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth }; 