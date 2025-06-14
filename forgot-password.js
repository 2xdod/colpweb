// Forgot Password Functionality

// Newsletter Management
const newsletterManager = {
    // Get newsletter subscribers
    getSubscribers() {
        return JSON.parse(localStorage.getItem('colp-newsletter-subscribers')) || [];
    },

    // Save subscribers
    saveSubscribers(subscribers) {
        localStorage.setItem('colp-newsletter-subscribers', JSON.stringify(subscribers));
    },

    // Add subscriber
    addSubscriber(email, source = 'website') {
        const subscribers = this.getSubscribers();
        const existingSubscriber = subscribers.find(sub => sub.email === email);
        
        if (existingSubscriber) {
            if (!existingSubscriber.active) {
                existingSubscriber.active = true;
                existingSubscriber.resubscribedAt = new Date().toISOString();
                this.saveSubscribers(subscribers);
                return { success: true, message: 'Welcome back! You\'ve been resubscribed to our newsletter.' };
            }
            return { success: false, message: 'This email is already subscribed to our newsletter.' };
        }

        const newSubscriber = {
            id: 'sub_' + Date.now(),
            email: email,
            subscribedAt: new Date().toISOString(),
            active: true,
            source: source,
            preferences: {
                promotions: true,
                newArrivals: true,
                stories: true
            }
        };

        subscribers.push(newSubscriber);
        this.saveSubscribers(subscribers);
        
        return { success: true, message: 'Successfully subscribed to newsletter!' };
    },

    // Remove subscriber
    removeSubscriber(email) {
        const subscribers = this.getSubscribers();
        const updatedSubscribers = subscribers.map(sub => {
            if (sub.email === email) {
                sub.active = false;
                sub.unsubscribedAt = new Date().toISOString();
            }
            return sub;
        });
        this.saveSubscribers(updatedSubscribers);
    },

    // Check if email is subscribed
    isSubscribed(email) {
        const subscribers = this.getSubscribers();
        const subscriber = subscribers.find(sub => sub.email === email);
        return subscriber && subscriber.active;
    }
};

// Password Reset Functionality
const passwordResetManager = {
    // Generate reset token
    generateResetToken() {
        return 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Send reset email (simulated)
    sendResetEmail(email) {
        const users = userManager.getAllUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'No account found with this email address.' };
        }

        const resetToken = this.generateResetToken();
        const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;
        
        // Store reset token
        const resetRequests = JSON.parse(localStorage.getItem('colp-reset-requests')) || [];
        resetRequests.push({
            email: email,
            token: resetToken,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
            used: false
        });
        localStorage.setItem('colp-reset-requests', JSON.stringify(resetRequests));

        // Simulate email sending
        console.log(`Password reset email sent to ${email}`);
        console.log(`Reset link: ${resetLink}`);
        
        return { 
            success: true, 
            message: 'Password reset link sent successfully!',
            resetLink: resetLink // In real app, this wouldn't be returned
        };
    },

    // Validate reset token
    validateResetToken(token) {
        const resetRequests = JSON.parse(localStorage.getItem('colp-reset-requests')) || [];
        const request = resetRequests.find(req => req.token === token && !req.used);
        
        if (!request) {
            return { valid: false, message: 'Invalid or expired reset token.' };
        }

        const now = new Date();
        const expiresAt = new Date(request.expiresAt);
        
        if (now > expiresAt) {
            return { valid: false, message: 'Reset token has expired. Please request a new one.' };
        }

        return { valid: true, email: request.email };
    },

    // Reset password
    resetPassword(token, newPassword) {
        const validation = this.validateResetToken(token);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Update user password
        const users = userManager.getAllUsers();
        const userIndex = users.findIndex(u => u.email === validation.email);
        
        if (userIndex === -1) {
            return { success: false, message: 'User not found.' };
        }

        users[userIndex].password = newPassword;
        users[userIndex].passwordChangedAt = new Date().toISOString();
        localStorage.setItem('colp-users', JSON.stringify(users));

        // Mark token as used
        const resetRequests = JSON.parse(localStorage.getItem('colp-reset-requests')) || [];
        const requestIndex = resetRequests.findIndex(req => req.token === token);
        if (requestIndex !== -1) {
            resetRequests[requestIndex].used = true;
            resetRequests[requestIndex].usedAt = new Date().toISOString();
            localStorage.setItem('colp-reset-requests', JSON.stringify(resetRequests));
        }

        return { success: true, message: 'Password reset successfully!' };
    }
};

// Handle forgot password form
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const resetBtn = document.getElementById('resetBtn');
    const form = document.getElementById('forgotPasswordForm');
    const successDiv = document.getElementById('forgotSuccess');
    
    // Show loading state
    resetBtn.textContent = 'Sending...';
    resetBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        const result = passwordResetManager.sendResetEmail(email);
        
        if (result.success) {
            // Hide form and show success message
            form.style.display = 'none';
            successDiv.style.display = 'block';
            
            // In development, show the reset link
            if (result.resetLink) {
                const debugLink = document.createElement('div');
                debugLink.className = 'debug-info';
                debugLink.innerHTML = `
                    <p><strong>Development Mode:</strong></p>
                    <a href="${result.resetLink}" target="_blank">Click here to reset password</a>
                `;
                successDiv.appendChild(debugLink);
            }
        } else {
            showCartNotification(result.message, 'error');
            resetBtn.textContent = 'Send Reset Link';
            resetBtn.disabled = false;
        }
    }, 1500);
}

// Resend reset link
function resendResetLink() {
    const email = document.getElementById('forgotEmail').value;
    if (email) {
        passwordResetManager.sendResetEmail(email);
        showCartNotification('Reset link sent again!', 'success');
    }
}

// Quick newsletter signup
function handleQuickNewsletter(event) {
    event.preventDefault();
    
    const email = document.getElementById('quickNewsletterEmail').value;
    const result = newsletterManager.addSubscriber(email, 'forgot-password-page');
    
    if (result.success) {
        showCartNotification(result.message, 'success');
        document.getElementById('quickNewsletterEmail').value = '';
    } else {
        showCartNotification(result.message, 'info');
    }
}

// Footer newsletter signup
function handleFooterNewsletter(event) {
    event.preventDefault();
    
    const email = document.getElementById('footerNewsletterEmail').value;
    const result = newsletterManager.addSubscriber(email, 'footer');
    
    if (result.success) {
        showCartNotification(result.message, 'success');
        document.getElementById('footerNewsletterEmail').value = '';
    } else {
        showCartNotification(result.message, 'info');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count
    updateCartCount();
    
    // Initialize wishlist
    wishlistManager.updateWishlistCount();
    
    // Initialize user system
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        userManager.updateUIForLoggedInUser(currentUser);
    } else {
        userManager.updateUIForLoggedOutUser();
    }
});