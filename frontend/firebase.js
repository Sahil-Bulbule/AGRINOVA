// Firebase configuration for feedback storage.
(function initFirebaseClient() {
    const fallbackConfig = {
        apiKey: "AIzaSyAn6T_KiTv4S1tsRJsUtAz1RXYLO42ZAYY",
        authDomain: "agrinova-3c095.firebaseapp.com",
        projectId: "agrinova-3c095",
        storageBucket: "agrinova-3c095.firebasestorage.app",
        messagingSenderId: "362895769097",
        appId: "1:362895769097:web:b93f9131fb68667df902d8",
        measurementId: "G-T8C4CQXT4L"
    };
    const firebaseConfig = window.__FIREBASE_CONFIG__ || fallbackConfig;

    try {
        if (typeof firebase === "undefined") {
            console.error("Firebase SDK not loaded.");
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase app initialized.");
        }

        if (firebase.analytics) {
            try { firebase.analytics(); } catch (analyticsError) { console.warn("Firebase analytics unavailable:", analyticsError); }
        }

        window.db = firebase.firestore();
        console.log("Firestore initialized.");
    } catch (error) {
        console.error("Firebase init error:", error);
    }
})();
