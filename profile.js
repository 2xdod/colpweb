// Profile Management JavaScript

// Check if user is logged in
function checkAuthAccess() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) {
        sessionStorage.setItem('auth-redirect', window.location.href);
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// Load user profile data
function loadProfileData() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    // Display profile information
    document.getElementById('displayFirstName').textContent = currentUser.firstName || '-';
    document.getElementById('displayLastName').textContent = currentUser.lastName || '-';
    document.getElementById('displayEmail').textContent = currentUser.email || '-';
    document.getElementById('displayBirthDate').textContent = currentUser.birthDate ? formatDate(currentUser.birthDate) : 'Not provided';
    document.getElementById('displayMemberSince').textContent = formatDate(currentUser.createdAt);
    document.getElementById('displayNewsletter').textContent = currentUser.newsletter ? 'Subscribed' : 'Not subscribed';

    // Fill edit form
    document.getElementById('editFirstName').value = currentUser.firstName || '';
    document.getElementById('editLastName').value = currentUser.lastName || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editBirthDate').value = currentUser.birthDate || '';
    document.getElementById('editNewsletter').checked = currentUser.newsletter || false;

    // Load statistics
    loadUserStats(currentUser);
}

// Load user statistics
function loadUserStats(user) {
    // Get user activities for order count
    const activities = userManager.getUserActivities(user.id);
    const orderCount = activities.filter(activity => activity.action === 'order_completed').length;
    
    // Get wishlist count
    const wishlist = wishlistManager.getWishlist();
    const wishlistCount = wishlist.length;
    
    // Calculate days since member
    const memberSince = new Date(user.createdAt);
    const now = new Date();
    const daysSince = Math.floor((now - memberSince) / (1000 * 60 * 60 * 24));
    
    // Update stats display
    document.getElementById('totalOrders').textContent = orderCount;
    document.getElementById('wishlistCount').textContent = wishlistCount;
    document.getElementById('newsletterStatus').textContent = user.newsletter ? 'Yes' : 'No';
    document.getElementById('daysSinceMember').textContent = daysSince;
}

// Toggle edit mode
function toggleEditMode() {
    const display = document.getElementById('profileDisplay');
    const edit = document.getElementById('profileEdit');
    const editBtn = document.querySelector('.section-header .btn-primary');
    
    display.style.display = 'none';
    edit.style.display = 'block';
    editBtn.style.display = 'none';
}

// Cancel edit mode
function cancelEdit() {
    const display = document.getElementById('profileDisplay');
    const edit = document.getElementById('profileEdit');
    const editBtn = document.querySelector('.section-header .btn-primary');
    
    display.style.display = 'block';
    edit.style.display = 'none';
    editBtn.style.display = 'block';
    
    // Reset form to original values
    loadProfileData();
}

// Handle profile update
function handleProfileUpdate(event) {
    event.preventDefault();
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;
    
    const formData = new FormData(event.target);
    const updatedData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        birthDate: formData.get('birthDate'),
        newsletter: formData.get('newsletter') === 'on'
    };
    
    // Check if email already exists (for other users)
    const allUsers = userManager.getAllUsers();
    const existingUser = allUsers.find(u => u.email === updatedData.email && u.id !== currentUser.id);
    
    if (existingUser) {
        showCartNotification('Email address is already in use by another account.', 'error');
        return;
    }
    
    // Update user data
    const users = userManager.getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        // Update user object
        Object.assign(users[userIndex], updatedData);
        users[userIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('colp-users', JSON.stringify(users));
        localStorage.setItem('colp-current-user', JSON.stringify(users[userIndex]));
        
        // Handle newsletter subscription changes
        const wasSubscribed = newsletterManager.isSubscribed(currentUser.email);
        const shouldSubscribe = updatedData.newsletter;
        
        if (shouldSubscribe && !wasSubscribed) {
            newsletterManager.addSubscriber(updatedData.email, 'profile-update');
        } else if (!shouldSubscribe && wasSubscribed) {
            newsletterManager.removeSubscriber(currentUser.email);
        }
        
        // Update UI
        loadProfileData();
        cancelEdit();
        
        showCartNotification('Profile updated successfully!', 'success');
        
        // Track activity
        userManager.trackUserActivity('profile_updated', { changes: Object.keys(updatedData) });
    }
}

// Handle password change
function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;
    
    const formData = new FormData(event.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmNewPassword');
    
    // Validate current password
    if (currentUser.password !== currentPassword) {
        showCartNotification('Current password is incorrect.', 'error');
        return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
        showCartNotification('New password must be at least 6 characters long.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showCartNotification('New passwords do not match.', 'error');
        return;
    }
    
    // Update password
    const users = userManager.getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        users[userIndex].passwordChangedAt = new Date().toISOString();
        
        localStorage.setItem('colp-users', JSON.stringify(users));
        localStorage.setItem('colp-current-user', JSON.stringify(users[userIndex]));
        
        // Clear form
        document.getElementById('passwordForm').reset();
        
        showCartNotification('Password changed successfully!', 'success');
        
        // Track activity
        userManager.trackUserActivity('password_changed');
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Not provided';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuthAccess()) {
        return;
    }
    
    // Load profile data
    loadProfileData();
    
    // Initialize cart and wishlist
    updateCartCount();
    wishlistManager.updateWishlistCount();
    
    // Initialize user navigation
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        userManager.updateUIForLoggedInUser(currentUser);
    }
    
    // Track page view
    userManager.trackUserActivity('page_view', { page: 'profile' });
    
    // Load addresses
    loadUserAddresses();
});

// Address Management System
const addressManager = {
    // Get user addresses
    getUserAddresses(userId) {
        const addresses = JSON.parse(localStorage.getItem(`colp-addresses-${userId}`)) || [];
        return addresses;
    },

    // Save user addresses
    saveUserAddresses(userId, addresses) {
        localStorage.setItem(`colp-addresses-${userId}`, JSON.stringify(addresses));
    },

    // Add new address
    addAddress(userId, addressData) {
        const addresses = this.getUserAddresses(userId);
        
        // If this is set as default, unset others
        if (addressData.isDefault) {
            addresses.forEach(addr => addr.isDefault = false);
        }
        
        // If this is the first address, make it default
        if (addresses.length === 0) {
            addressData.isDefault = true;
        }
        
        addressData.id = 'addr_' + Date.now();
        addressData.createdAt = new Date().toISOString();
        
        addresses.push(addressData);
        this.saveUserAddresses(userId, addresses);
        return addressData;
    },

    // Update address
    updateAddress(userId, addressId, addressData) {
        const addresses = this.getUserAddresses(userId);
        const index = addresses.findIndex(addr => addr.id === addressId);
        
        if (index !== -1) {
            // If this is set as default, unset others
            if (addressData.isDefault) {
                addresses.forEach(addr => addr.isDefault = false);
            }
            
            addresses[index] = { ...addresses[index], ...addressData };
            this.saveUserAddresses(userId, addresses);
            return addresses[index];
        }
        return null;
    },

    // Delete address
    deleteAddress(userId, addressId) {
        const addresses = this.getUserAddresses(userId);
        const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
        
        // If deleted address was default and there are other addresses, make first one default
        const deletedAddress = addresses.find(addr => addr.id === addressId);
        if (deletedAddress && deletedAddress.isDefault && filteredAddresses.length > 0) {
            filteredAddresses[0].isDefault = true;
        }
        
        this.saveUserAddresses(userId, filteredAddresses);
        return true;
    },

    // Get default address
    getDefaultAddress(userId) {
        const addresses = this.getUserAddresses(userId);
        return addresses.find(addr => addr.isDefault) || addresses[0] || null;
    }
};

// Load user addresses
function loadUserAddresses() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const addresses = addressManager.getUserAddresses(currentUser.id);
    const container = document.getElementById('addressesContainer');
    
    if (addresses.length === 0) {
        container.innerHTML = `
            <div class="no-addresses">
                <p>No saved addresses yet. Add your first address to make checkout faster!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = addresses.map(address => `
        <div class="address-card ${address.isDefault ? 'default-address' : ''}" data-address-id="${address.id}">
            <div class="address-header">
                <div class="address-title">
                    <h4>${address.title}</h4>
                    ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
                </div>
                <div class="address-actions">
                    <button class="btn-edit" onclick="editAddress('${address.id}')">✏️</button>
                    <button class="btn-delete" onclick="deleteAddress('${address.id}')">🗑️</button>
                </div>
            </div>
            <div class="address-details">
                <p><strong>${address.firstName} ${address.lastName}</strong></p>
                ${address.phone ? `<p>📞 ${address.phone}</p>` : ''}
                <p>📍 ${address.street}</p>
                <p>${address.city}, ${address.state} ${address.zip}</p>
                <p>${getCountryName(address.country)}</p>
            </div>
            ${!address.isDefault ? `<button class="btn-set-default" onclick="setDefaultAddress('${address.id}')">Set as Default</button>` : ''}
        </div>
    `).join('');
}

// Show add address modal
function showAddAddressModal() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    // Pre-fill with user info
    document.getElementById('addressFirstName').value = currentUser.firstName || '';
    document.getElementById('addressLastName').value = currentUser.lastName || '';
    
    document.getElementById('addAddressModal').style.display = 'flex';
}

// Close add address modal
function closeAddAddressModal() {
    document.getElementById('addAddressModal').style.display = 'none';
    document.getElementById('addAddressForm').reset();
}

// Handle add address
function handleAddAddress(event) {
    event.preventDefault();
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const formData = new FormData(event.target);
    const addressData = {
        title: formData.get('title'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
        country: formData.get('country'),
        isDefault: formData.get('isDefault') === 'on'
    };

    addressManager.addAddress(currentUser.id, addressData);
    loadUserAddresses();
    closeAddAddressModal();
    
    showCartNotification('Address saved successfully!', 'success');
    userManager.trackUserActivity('address_added');
}

// Edit address
function editAddress(addressId) {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const addresses = addressManager.getUserAddresses(currentUser.id);
    const address = addresses.find(addr => addr.id === addressId);
    
    if (!address) return;

    // Fill form with existing data
    document.getElementById('addressTitle').value = address.title;
    document.getElementById('addressFirstName').value = address.firstName;
    document.getElementById('addressLastName').value = address.lastName;
    document.getElementById('addressPhone').value = address.phone || '';
    document.getElementById('addressStreet').value = address.street;
    document.getElementById('addressCity').value = address.city;
    document.getElementById('addressState').value = address.state;
    document.getElementById('addressZip').value = address.zip;
    document.getElementById('addressCountry').value = address.country;
    document.getElementById('isDefaultAddress').checked = address.isDefault;

    // Change form to edit mode
    const form = document.getElementById('addAddressForm');
    form.dataset.editId = addressId;
    
    // Change modal title and button
    document.querySelector('#addAddressModal .modal-header h2').textContent = '✏️ Edit Address';
    document.querySelector('#addAddressForm button[type="submit"]').textContent = 'Update Address';
    
    document.getElementById('addAddressModal').style.display = 'flex';
}

// Delete address
function deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) return;

        addressManager.deleteAddress(currentUser.id, addressId);
        loadUserAddresses();
        
        showCartNotification('Address deleted successfully!', 'success');
        userManager.trackUserActivity('address_deleted');
    }
}

// Set default address
function setDefaultAddress(addressId) {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    addressManager.updateAddress(currentUser.id, addressId, { isDefault: true });
    loadUserAddresses();
    
    showCartNotification('Default address updated!', 'success');
}

// Get country name
function getCountryName(countryCode) {
    const countries = {
        'US': 'United States',
        'CA': 'Canada',
        'UK': 'United Kingdom',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'TR': 'Turkey',
        'other': 'Other'
    };
    return countries[countryCode] || countryCode;
}

// Update the form submit handler to handle both add and edit
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addAddressForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const editId = form.dataset.editId;
            if (editId) {
                // Edit mode
                const currentUser = userManager.getCurrentUser();
                if (!currentUser) return;

                const formData = new FormData(event.target);
                const addressData = {
                    title: formData.get('title'),
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    phone: formData.get('phone'),
                    street: formData.get('street'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zip: formData.get('zip'),
                    country: formData.get('country'),
                    isDefault: formData.get('isDefault') === 'on'
                };

                addressManager.updateAddress(currentUser.id, editId, addressData);
                loadUserAddresses();
                closeAddAddressModal();
                
                // Reset form
                delete form.dataset.editId;
                document.querySelector('#addAddressModal .modal-header h2').textContent = '📍 Add New Address';
                document.querySelector('#addAddressForm button[type="submit"]').textContent = 'Save Address';
                
                showCartNotification('Address updated successfully!', 'success');
                userManager.trackUserActivity('address_updated');
            } else {
                // Add mode - call existing function
                handleAddAddress(event);
            }
        });
    }
});