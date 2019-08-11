const firebase = require('firebase');

firebase.initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "ederalgorithm.firebaseapp.com",
  databaseURL: "https://ederalgorithm.firebaseio.com",
  projectId: "ederalgorithm",
  storageBucket: "",
  messagingSenderId: "179963881615",
  appId: "1:179963881615:web:5568709fd6070ee7"
});

module.exports = firebase.database();