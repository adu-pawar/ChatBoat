// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBT-TiI82_-55ecnUp6ZmtjsNu49HAfqmE",
  authDomain: "chatsbot-01.firebaseapp.com",
  projectId: "chatsbot-01",
  storageBucket: "chatsbot-01.firebasestorage.app",
  messagingSenderId: "1044240923525",
  appId: "1:1044240923525:web:6dc477ff5a28b18476a2ec",
  measurementId: "G-7HS0N9GWH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
