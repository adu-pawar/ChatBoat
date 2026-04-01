import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-credential':
            return 'Incorrect email or password. Please try again, or sign up if you don\'t have an account.';
        case 'auth/user-not-found':
            return 'No account found with this email. Please sign up first.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please log in instead.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please wait a moment and try again.';
        case 'auth/operation-not-allowed':
            return 'Email/Password sign-in is not enabled. Please enable it in the Firebase Console.';
        default:
            return 'Something went wrong. Please try again.';
    }
}

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-btn');
        
        try {
            loginBtn.disabled = true;
            loginBtn.innerHTML = 'Signing in...';
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Login Error:", error);
            alert(getErrorMessage(error.code));
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
        }
    });
}

// Handle Signup
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const signupBtn = document.getElementById('signup-btn');

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            signupBtn.disabled = true;
            signupBtn.innerHTML = 'Creating account...';
            await createUserWithEmailAndPassword(auth, email, password);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Signup Error:", error);
            alert(getErrorMessage(error.code));
        } finally {
            signupBtn.disabled = false;
            signupBtn.innerHTML = 'Create Account';
        }
    });
}

// Global Auth State Observer & Redirects
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        // User is signed in
        if (currentPage === 'login.html' || currentPage === 'signup.html' || currentPage === '') {
            // If on auth pages, redirect to dashboard/index
            // (Only redirect if not already on index.html)
            if (currentPage !== 'index.html') {
                window.location.href = 'index.html';
            }
        }
        
        // Update UI if on index.html
        if (currentPage === 'index.html' || currentPage === '') {
            const userEmailSpan = document.getElementById('user-email');
            if (userEmailSpan) userEmailSpan.textContent = user.email;
        }

    } else {
        // User is signed out
        if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
            window.location.href = 'login.html';
        }
    }
});

// Logout Functionality
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Logout Error:", error);
    }
};
