// Utility Functions
async function checkUserExists(email) {
    try {
      const methods = await auth.fetchSignInMethodsForEmail(email);
      return methods.length > 0;
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    }
  }
  
  // Login Handler
  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target['login-email'].value.trim();
    const password = e.target['login-password'].value;
  
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
  
    try {
      // Check user exists first
      const userExists = await checkUserExists(email);
      if (!userExists) {
        alert("No account found with this email");
        return;
      }
  
      // Attempt login
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        console.warn("Email not verified");
        // Optional: Send verification email
        // await userCredential.user.sendEmailVerification();
      }
      
      // Redirect on success
      window.location.href = 'dashboard.html';
      
    } catch (error) {
      console.error("Login error:", error);
      handleAuthError(error);
    }
  }
  
  // Error Handler
  function handleAuthError(error) {
    let message = "Login failed. Please try again.";
    
    switch(error.code) {
      case 'auth/wrong-password':
        message = "Incorrect password";
        break;
      case 'auth/user-not-found':
        message = "No account found with this email";
        break;
      case 'auth/too-many-requests':
        message = "Account temporarily locked. Try again later.";
        break;
      case 'auth/invalid-email':
        message = "Invalid email format";
        break;
    }
    
    alert(message);
  }
  
  // Initialize Auth System
  document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
  
    // Password Reset
    document.querySelector('#forgot-password')?.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = prompt("Enter your email to reset password:");
      if (email) {
        try {
          await auth.sendPasswordResetEmail(email);
          alert("Password reset email sent. Check your inbox.");
        } catch (error) {
          handleAuthError(error);
        }
      }
    });
  });