import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyACqt6EU_HXMERYlr749oXsLd5oSibgylA",
    authDomain: "tourism-4521b.firebaseapp.com",
    projectId: "tourism-4521b",
    storageBucket: "tourism-4521b.appspot.com",
    messagingSenderId: "277991998919",
    appId: "1:277991998919:web:c16e1f63084e748ac285e2",
    measurementId: "G-9J70ZG3PJ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use the IDs/classes from your forget.html file
const forgotPasswordForm = document.querySelector(".forget form");
const emailInput = document.querySelector(".email1");
const submitButton = document.getElementById("forgotPassBtn");

forgotPasswordForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Stop the form from submitting normally
    
    // Disable the button to prevent multiple clicks
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    const email = emailInput.value;

    if (!email) {
        alert("Please enter your email address.");
        submitButton.disabled = false;
        submitButton.textContent = "Change the password";
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("A password reset email has been sent to " + email + ". Check your inbox (and spam folder)!");
            // Optionally redirect the user back to the login page
            window.location.href = "Log-In.html"; 
        })
        .catch((error) => {
            console.error(error.code, error.message);
            
            let errorMessage = "Could not send password reset email. Please try again.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No user found with that email address.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
            }
            
            alert(errorMessage);
            submitButton.disabled = false;
            submitButton.textContent = "Change the password";
        });
});