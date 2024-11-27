// firebase/firebaseConfig.js
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const { getAnalytics } = require('firebase/analytics');

const firebaseConfig = {
  apiKey: "AIzaSyBcYvQeoXm9XIMIVlspVi-CvzoLwsKcARU",
  authDomain: "peopleconnect-aaf57.firebaseapp.com",
  databaseURL: "https://peopleconnect-aaf57-default-rtdb.firebaseio.com",
  projectId: "peopleconnect-aaf57",
  storageBucket: "peopleconnect-aaf57.appspot.com",
  messagingSenderId: "252587270466",
  appId: "1:252587270466:web:f597e239277828466a28db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app); // Initialize Realtime Database

module.exports = { database };
