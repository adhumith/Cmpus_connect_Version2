import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvvqHfhDg2SVAd9NMW58caMUjFxRncRbs",
  authDomain: "campus-connect-10ad5.firebaseapp.com",
  projectId: "campus-connect-10ad5",
  storageBucket: "campus-connect-10ad5.firebasestorage.app",
  messagingSenderId: "863812450550",
  appId: "1:863812450550:web:218c57144efe9dbec714d7",
  measurementId: "G-D6XK9PMH8S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);