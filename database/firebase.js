// AgriNova Firebase Configuration
// This file initializes the cloud connection for Feedbacks

const firebaseConfig = {
    apiKey: "AIzaSyAn6T_KiTv4S1tsRJsUtAz1RXYLO42ZAYY",
    authDomain: "agrinova-3c095.firebaseapp.com",
    projectId: "agrinova-3c095",
    storageBucket: "agrinova-3c095.firebasestorage.app",
    messagingSenderId: "362895769097",
    appId: "1:362895769097:web:b93f9131fb68667df902d8",
    measurementId: "G-T8C4CQXT4L"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("🔥 Firebase App Initialized");
    }
} catch (e) {
    console.error("❌ Firebase Init Error:", e);
}

// Global Firestore handle
var db;
try {
    db = firebase.firestore();
    console.log("✅ Firestore Service Started");
} catch (e) {
    console.error("❌ Firestore Init Error (Maybe not enabled in console?):", e);
}

console.log("🚀 Firebase Script Loaded");
