
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBT_6j1Sg7cqFJRxQneKXVwU_5pOU_RluQ",
  authDomain: "mineplay-online.firebaseapp.com",
  databaseURL: "https://mineplay-online-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mineplay-online",
  storageBucket: "mineplay-online.firebasestorage.app",
  messagingSenderId: "240664126634",
  appId: "1:240664126634:web:7410f6b5416728590b1cd3"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log("Firebase connected");
