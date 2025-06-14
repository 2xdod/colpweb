// Settings Page JavaScript

// Load user settings
function loadUserSettings() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    // Load email preferences
    document.getElementById('newsletterPref').checked = currentUser.newsletter || false;
    
    // Load user preferences from localStorage or set defaults
    const preferences = JSON.parse(localStorage.getItem(`colp-preferences-${currentUser.id}`)) || {
        promotions: true,
        newArrivals: true,
        orderUpdates: true,
        browserNotifications: false,
        soundNotifications: true,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC'
    };

    // Set email preferences
    document.getElementById('promotionsPref').checked = preferences.promotions;
    document.getElementById('newArrivalsPref').checked = preferences.newArrivals;
    document.getElementById('orderUpdatesPref').checked = preferences.orderUpdates;

    // Set notification preferences
    document.getElementById('browserNotifications').checked = preferences.browserNotifications;
    document.getElementById('soundNotifications').checked = preferences.soundNotifications;

    // Set display preferences
    document.getElementById('language').value = preferences.language;
    document.getElementById('currency').value = preferences.currency;
    document.getElementById('timezone').value = preferences.timezone;
}

// Save user preferences
function saveUserPreferences(preferences) {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    localStorage.setItem(`colp-preferences-${currentUser.id}`, JSON.stringify(preferences));
}

// Handle email preferences
function handleEmailPreferences(event) {
    event.preventDefault();
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const formData = new FormData(event.target);
    const newsletterEnabled = formData.get('newsletter') === 'on';
    
    // Update user's newsletter setting
    const users = userManager.getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].newsletter = newsletterEnabled;
        localStorage.setItem('colp-users', JSON.stringify(users));
        localStorage.setItem('colp-current-user', JSON.stringify(users[userIndex]));
    }

    // Handle newsletter subscription
    if (newsletterEnabled && !newsletterManager.isSubscribed(currentUser.email)) {
        newsletterManager.addSubscriber(currentUser.email, 'settings');
    } else if (!newsletterEnabled && newsletterManager.isSubscribed(currentUser.email)) {
        newsletterManager.removeSubscriber(currentUser.email);
    }

    // Save other email preferences
    const preferences = JSON.parse(localStorage.getItem(`colp-preferences-${currentUser.id}`)) || {};
    preferences.promotions = formData.get('promotions') === 'on';
    preferences.newArrivals = formData.get('newArrivals') === 'on';
    preferences.orderUpdates = formData.get('orderUpdates') === 'on';
    
    saveUserPreferences(preferences);
    
    showCartNotification('Email preferences updated successfully!', 'success');
    userManager.trackUserActivity('settings_updated', { type: 'email_preferences' });
}

// Handle notification settings
function handleNotificationSettings(event) {
    event.preventDefault();
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const formData = new FormData(event.target);
    const preferences = JSON.parse(localStorage.getItem(`colp-preferences-${currentUser.id}`)) || {};
    
    preferences.browserNotifications = formData.get('browserNotifications') === 'on';
    preferences.soundNotifications = formData.get('soundNotifications') === 'on';
    
    // Request browser notification permission if enabled
    if (preferences.browserNotifications && 'Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('COLP Notifications Enabled', {
                        body: 'You will now receive browser notifications from COLP!',
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    }
    
    saveUserPreferences(preferences);
    
    showCartNotification('Notification settings updated successfully!', 'success');
    userManager.trackUserActivity('settings_updated', { type: 'notifications' });
}

// Handle display settings
function handleDisplaySettings(event) {
    event.preventDefault();
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const formData = new FormData(event.target);
    const preferences = JSON.parse(localStorage.getItem(`colp-preferences-${currentUser.id}`)) || {};
    
    preferences.language = formData.get('language');
    preferences.currency = formData.get('currency');
    preferences.timezone = formData.get('timezone');
    
    saveUserPreferences(preferences);
    
    showCartNotification('Display settings updated successfully!', 'success');
    userManager.trackUserActivity('settings_updated', { type: 'display' });
    
    // Show message about language change (if implemented)
    if (preferences.language !== 'en') {
        showCartNotification('Language change will take effect on next page reload.', 'info');
    }
}

// Export user data
function exportUserData() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const activities = userManager.getUserActivities(currentUser.id);
    const preferences = JSON.parse(localStorage.getItem(`colp-preferences-${currentUser.id}`)) || {};
    const wishlist = wishlistManager.getWishlistProducts();
    const cart = JSON.parse(localStorage.getItem('colp-cart')) || [];
    
    const userData = {
        user: currentUser,
        preferences: preferences,
        activities: activities,
        wishlist: wishlist,
        cart: cart,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `colp-user-data-${currentUser.firstName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCartNotification('User data exported successfully!', 'success');
    userManager.trackUserActivity('data_exported');
}

// Clear browsing data
function clearBrowsingData() {
    if (confirm('Are you sure you want to clear your browsing data? This will remove your cart, wishlist, and preferences (but keep your account).')) {
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) return;

        // Clear user-specific data
        localStorage.removeItem(`colp-preferences-${currentUser.id}`);
        localStorage.removeItem('colp-cart');
        localStorage.removeItem('colp-wishlist');
        
        // Clear activities for this user
        const allActivities = userManager.getUserActivities();
        const otherActivities = allActivities.filter(activity => activity.userId !== currentUser.id);
        localStorage.setItem('colp-user-activities', JSON.stringify(otherActivities));
        
        showCartNotification('Browsing data cleared successfully!', 'success');
        
        // Reload page to reflect changes
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Delete account
function deleteAccount() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const confirmText = 'DELETE';
    const userInput = prompt(`Are you sure you want to permanently delete your account?\n\nThis action cannot be undone. All your data will be permanently removed.\n\nType "${confirmText}" to confirm:`);
    
    if (userInput === confirmText) {
        // Remove user from users list
        const users = userManager.getAllUsers();
        const updatedUsers = users.filter(u => u.id !== currentUser.id);
        localStorage.setItem('colp-users', JSON.stringify(updatedUsers));
        
        // Remove user from newsletter
        newsletterManager.removeSubscriber(currentUser.email);
        
        // Clear all user data
        localStorage.removeItem('colp-current-user');
        localStorage.removeItem(`colp-preferences-${currentUser.id}`);
        localStorage.removeItem('colp-cart');
        localStorage.removeItem('colp-wishlist');
        
        // Remove user activities
        const allActivities = userManager.getUserActivities();
        const otherActivities = allActivities.filter(activity => activity.userId !== currentUser.id);
        localStorage.setItem('colp-user-activities', JSON.stringify(otherActivities));
        
        alert('Your account has been permanently deleted. You will now be redirected to the homepage.');
        
        // Redirect to homepage
        window.location.href = 'index.html';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuthAccess()) {
        return;
    }
    
    // Load settings
    loadUserSettings();
    
    // Initialize cart and wishlist
    updateCartCount();
    wishlistManager.updateWishlistCount();
    
    // Initialize user navigation
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        userManager.updateUIForLoggedInUser(currentUser);
    }
    
    // Track page view
    userManager.trackUserActivity('page_view', { page: 'settings' });
});