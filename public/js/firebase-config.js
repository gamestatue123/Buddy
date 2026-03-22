const firebaseConfig = {
  apiKey: "AIzaSyCtu9xTssIZD3S99ekm2gwc1PySwiv0h9Y",
  authDomain: "buddy-app-jee.firebaseapp.com",
  projectId: "buddy-app-jee",
  storageBucket: "buddy-app-jee.firebasestorage.app",
  messagingSenderId: "888730193846",
  appId: "1:888730193846:web:4cfc94b24cdb3323e03b17"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Set persistence to LOCAL
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);