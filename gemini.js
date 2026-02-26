import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,sendPasswordResetEmail,onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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

const submit = document.getElementById("submit");
const login = document.querySelector(".Login");

submit.addEventListener("click", (event) => {
    event.preventDefault();
    // const username = document.querySelector(".username").value;
    const email = document.querySelector(".email").value;
    const password = document.querySelector(".password").value;
    const passwordn = document.querySelector(".passwordn").value;
    const passwordError = document.querySelector(".password-error");
    if (password !== passwordn) {
        // alert("Passwords do not match. Please try again.");
        passwordError.textContent="Both password are not same";
        return;
        }
    passwordError.textContent = "";
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "plan.html";
        })
        .catch((error) => {
            console.error(error.code, error.message);
            alert(error.message);
        });
});

login.addEventListener("click", (event) => {
    event.preventDefault();
    // const forgotpassword =document.querySelector("#forgotpass")

    const email = document.querySelector(".email1").value;
    const password = document.querySelector(".password1").value;
    const loginError = document.querySelector(".login-error");

    loginError.textContent = "";
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "plan.html";
        })
        .catch((error) => {
            console.error(error.code, error.message);
            // alert(error.message);
            if (error.code === "auth/invalid-credential") {
                loginError.textContent = "Wrong email or password. Please try again.";
            } else {
                // Show other errors directly (e.g., network issues)
                loginError.textContent = error.message;
            }
        });
});

