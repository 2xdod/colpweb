// Admin Dashboard Functionality

// Admin authentication and access control
const adminManager = {
    // Check if current user is admin
    isCurrentUserAdmin() {
        const currentUser = userManager.getCurrentUser();
        return userManager.isAdmin(currentUser);
    },

    // Check if current user is super admin
    isSuperAdmin() {
        const currentUser = userManager.getCurrentUser();
        return currentUser && (currentUser.email === 'admin@colp.co' || currentUser.role === 'super_admin');
    },

    // Redirect non-admin users
    enforceAdminAccess() {
        if (!this.isCurrentUserAdmin()) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Get admin dashboard data
    getDashboardData() {
        const users = userManager.getAllUsers();
        const activities = userManager.getUserActivities();
        const cart = JSON.parse(localStorage.getItem('colp-cart')) || [];
        
        return {
            users: users,
            activities: activities,
            totalUsers: users.length,
            totalActivities: activities.length,
            activeOrders: this.getActiveOrdersCount(),
            totalRevenue: this.calculateTotalRevenue()
        };
    },

    // Calculate total revenue (mock calculation)
    calculateTotalRevenue() {
        const orders = JSON.parse(localStorage.getItem('colp-orders')) || [];
        return orders.reduce((total, order) => total + (order.amount || 0), 0);
    },

    // Get active orders count
    getActiveOrdersCount() {
        const orders = JSON.parse(localStorage.getItem('colp-orders')) || [];
        return orders.filter(order => order.status !== 'completed').length;
    }
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        // Check admin access
        if (!adminManager.enforceAdminAccess()) {
            return;
        }

        // Load dashboard data
        loadDashboard();
        
        // Update data every 30 seconds
        setInterval(loadDashboard, 30000);
    }
});

// Load dashboard data
function loadDashboard() {
    const data = adminManager.getDashboardData();
    
    // Update statistics
    updateDashboardStats(data);
    
    // Load users table
    loadUsersTable(data.users);
    
    // Load activities
    loadActivitiesTable(data.activities);
    
    // Load analytics
    loadAnalytics(data);
}

// Update dashboard statistics
function updateDashboardStats(data) {
    document.getElementById('totalUsers').textContent = data.totalUsers;
    document.getElementById('activeOrders').textContent = data.activeOrders;
    document.getElementById('totalActivities').textContent = data.totalActivities;
    document.getElementById('totalRevenue').textContent = `$${data.totalRevenue.toFixed(2)}`;
}

// Load users table with both registered users and newsletter subscribers
function loadUsersTable(users = null) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    // Get all users and newsletter subscribers
    const allUsers = users || userManager.getAllUsers();
    const newsletterSubscribers = newsletterManager.getSubscribers();
    
    // Create combined list with type information
    const combinedList = [];
    
    // Add registered users
    allUsers.forEach(user => {
        const isNewsletterSubscribed = newsletterSubscribers.some(sub => sub.email === user.email && sub.active);
        combinedList.push({
            ...user,
            type: 'registered',
            isNewsletterSubscribed: isNewsletterSubscribed,
            displayName: `${user.firstName} ${user.lastName}`,
            registrationDate: user.createdAt,
            isUser: true
        });
    });
    
    // Add newsletter-only subscribers (those not registered as users)
    newsletterSubscribers.forEach(subscriber => {
        if (subscriber.active) {
            const existingUser = allUsers.find(user => user.email === subscriber.email);
            if (!existingUser) {
                combinedList.push({
                    id: subscriber.id,
                    email: subscriber.email,
                    type: 'newsletter',
                    isNewsletterSubscribed: true,
                    displayName: subscriber.email,
                    registrationDate: subscriber.subscribedAt,
                    isUser: false,
                    subscriberData: subscriber
                });
            }
        }
    });

    tbody.innerHTML = '';

    if (combinedList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="no-data">No users or subscribers found</td>
            </tr>
        `;
        return;
    }

    combinedList.forEach(item => {
        const activities = item.isUser ? userManager.getUserActivities(item.id) : [];
        const cartItems = item.isUser ? getCartItemsForUser(item.id) : [];
        const wishlistItems = item.isUser ? getWishlistItemsForUser(item.id) : [];
        
        // Determine user type display
        let userType = '';
        let typeClass = '';
        if (item.type === 'registered' && item.isNewsletterSubscribed) {
            userType = 'User + Newsletter';
            typeClass = 'user-both';
        } else if (item.type === 'registered') {
            userType = 'Registered User';
            typeClass = 'user-registered';
        } else if (item.type === 'newsletter') {
            userType = 'Newsletter Only';
            typeClass = 'user-newsletter';
        }
        
        const row = document.createElement('tr');
        row.setAttribute('data-user-type', item.type);
        row.setAttribute('data-newsletter-status', item.isNewsletterSubscribed ? 'subscribed' : 'not-subscribed');
        
        row.innerHTML = `
            <td>
                <div class="user-info">
                    <div class="user-avatar">${item.isUser ? '👤' : '📧'}</div>
                    <div>
                        <div class="user-name">${item.displayName}</div>
                        <div class="user-role">${item.isUser ? (item.role || 'customer') : 'subscriber'}</div>
                    </div>
                </div>
            </td>
            <td>${item.email}</td>
            <td>
                <span class="type-badge ${typeClass}">${userType}</span>
            </td>
            <td>${formatDate(item.registrationDate)}</td>
            <td>${item.isUser ? formatDate(item.lastLogin) : 'N/A'}</td>
            <td>
                <span class="activity-badge">${activities.length}</span>
            </td>
            <td>
                <span class="cart-badge">${cartItems.length}</span>
            </td>
            <td>
                <span class="wishlist-badge">${wishlistItems.length}</span>
            </td>
            <td>
                <div class="action-buttons">
                    ${item.isUser ? 
                        `<button class="btn-view" onclick="viewUserDetails('${item.id}')">👁️ View</button>
                         <button class="btn-message" onclick="messageUser('${item.id}')">💬 Message</button>` :
                        `<button class="btn-view" onclick="viewSubscriberDetails('${item.id}')">👁️ View</button>
                         <button class="btn-danger" onclick="removeNewsletterSubscriber('${item.email}')">🗑️ Remove</button>`
                    }
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load activities table
function loadActivitiesTable(activities) {
    const container = document.getElementById('activitiesList');
    if (!container) return;

    container.innerHTML = '';

    if (activities.length === 0) {
        container.innerHTML = '<p class="no-data">No activities found</p>';
        return;
    }

    // Sort activities by timestamp (newest first)
    const sortedActivities = activities.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Show only last 100 activities for performance
    const recentActivities = sortedActivities.slice(0, 100);

    recentActivities.forEach(activity => {
        const user = userManager.getAllUsers().find(u => u.id === activity.userId);
        const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.innerHTML = `
            <div class="activity-icon">${getActivityIcon(activity.action)}</div>
            <div class="activity-content">
                <div class="activity-header">
                    <span class="activity-user">${userName}</span>
                    <span class="activity-action">${formatActivityAction(activity.action)}</span>
                    <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
                </div>
                <div class="activity-details">
                    ${formatActivityDetails(activity)}
                </div>
            </div>
        `;
        container.appendChild(activityElement);
    });
}

// Load analytics
function loadAnalytics(data) {
    loadPopularProducts();
    loadActivityTimeline(data.activities);
    loadCartAnalytics();
    loadUserDemographics(data.users);
}

// Load popular products analytics
function loadPopularProducts() {
    const activities = userManager.getUserActivities();
    const productStats = {};

    // Count add to cart activities
    activities.forEach(activity => {
        if (activity.action === 'add_to_cart' && activity.data.productId) {
            const productId = activity.data.productId;
            productStats[productId] = (productStats[productId] || 0) + 1;
        }
    });

    // Sort by popularity
    const sortedProducts = Object.entries(productStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    const container = document.getElementById('popularProducts');
    if (!container) return;

    if (sortedProducts.length === 0) {
        container.innerHTML = '<p class="no-data">No product data available</p>';
        return;
    }

    container.innerHTML = sortedProducts.map(([productId, count]) => {
        const productName = getProductName(productId);
        return `
            <div class="popular-product-item">
                <span class="product-name">${productName}</span>
                <span class="product-count">${count} adds</span>
            </div>
        `;
    }).join('');
}

// Load activity timeline
function loadActivityTimeline(activities) {
    const container = document.getElementById('activityTimeline');
    if (!container) return;

    // Group activities by hour for the last 24 hours
    const now = new Date();
    const hoursData = {};

    // Initialize hours
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
        const hourKey = hour.getHours();
        hoursData[hourKey] = 0;
    }

    // Count activities in each hour
    activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp);
        const hoursDiff = (now - activityDate) / (1000 * 60 * 60);
        
        if (hoursDiff <= 24) {
            const hour = activityDate.getHours();
            hoursData[hour]++;
        }
    });

    // Create simple bar chart
    const maxCount = Math.max(...Object.values(hoursData));
    container.innerHTML = Object.entries(hoursData).map(([hour, count]) => {
        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return `
            <div class="timeline-bar">
                <div class="timeline-bar-fill" style="height: ${height}%"></div>
                <div class="timeline-hour">${hour}:00</div>
                <div class="timeline-count">${count}</div>
            </div>
        `;
    }).join('');
}

// Load cart analytics
function loadCartAnalytics() {
    const activities = userManager.getUserActivities();
    const users = userManager.getAllUsers();
    
    let cartsWithItems = 0;
    let cartsAbandoned = 0;
    let cartsConverted = 0;

    users.forEach(user => {
        const userActivities = activities.filter(a => a.userId === user.id);
        const hasAddToCart = userActivities.some(a => a.action === 'add_to_cart');
        const hasOrder = userActivities.some(a => a.action === 'order_completed');
        
        if (hasAddToCart) {
            cartsWithItems++;
            if (hasOrder) {
                cartsConverted++;
            } else {
                cartsAbandoned++;
            }
        }
    });

    const conversionRate = cartsWithItems > 0 ? (cartsConverted / cartsWithItems * 100).toFixed(1) : 0;
    const abandonmentRate = cartsWithItems > 0 ? (cartsAbandoned / cartsWithItems * 100).toFixed(1) : 0;

    const container = document.getElementById('cartAnalytics');
    if (!container) return;

    container.innerHTML = `
        <div class="cart-metric">
            <span class="metric-label">Conversion Rate:</span>
            <span class="metric-value">${conversionRate}%</span>
        </div>
        <div class="cart-metric">
            <span class="metric-label">Abandonment Rate:</span>
            <span class="metric-value">${abandonmentRate}%</span>
        </div>
        <div class="cart-metric">
            <span class="metric-label">Active Carts:</span>
            <span class="metric-value">${cartsWithItems}</span>
        </div>
    `;
}

// Load user demographics
function loadUserDemographics(users) {
    const container = document.getElementById('userDemographics');
    if (!container) return;

    const totalUsers = users.length;
    const newUsersThisWeek = users.filter(user => {
        const userDate = new Date(user.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return userDate > weekAgo;
    }).length;

    const activeUsersThisWeek = users.filter(user => {
        const lastLogin = new Date(user.lastLogin);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastLogin > weekAgo;
    }).length;

    container.innerHTML = `
        <div class="demo-metric">
            <span class="metric-label">Total Users:</span>
            <span class="metric-value">${totalUsers}</span>
        </div>
        <div class="demo-metric">
            <span class="metric-label">New This Week:</span>
            <span class="metric-value">${newUsersThisWeek}</span>
        </div>
        <div class="demo-metric">
            <span class="metric-label">Active This Week:</span>
            <span class="metric-value">${activeUsersThisWeek}</span>
        </div>
    `;
}

// Tab switching
function switchAdminTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load specific data for the tab
    if (tabName === 'analytics') {
        loadAnalytics(adminManager.getDashboardData());
    } else if (tabName === 'admins') {
        loadAdminsTable();
        // Show/hide add admin button based on permissions
        const addAdminBtn = document.getElementById('addAdminBtn');
        if (addAdminBtn) {
            addAdminBtn.style.display = adminManager.isSuperAdmin() ? 'block' : 'none';
        }
    } else if (tabName === 'newsletter') {
        loadNewsletterTable();
    }
}

// User filtering and sorting
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterUsersByType() {
    const filterValue = document.getElementById('userFilter').value;
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const userType = row.getAttribute('data-user-type');
        const newsletterStatus = row.getAttribute('data-newsletter-status');
        let shouldShow = false;
        
        switch (filterValue) {
            case 'all':
                shouldShow = true;
                break;
            case 'registered':
                shouldShow = userType === 'registered';
                break;
            case 'newsletter':
                shouldShow = userType === 'newsletter';
                break;
            case 'both':
                shouldShow = userType === 'registered' && newsletterStatus === 'subscribed';
                break;
            default:
                shouldShow = true;
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
}

function sortUsers() {
    const sortBy = document.getElementById('userSort').value;
    const users = userManager.getAllUsers();
    
    users.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'name-asc':
                return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
            case 'name-desc':
                return (b.firstName + b.lastName).localeCompare(a.firstName + a.lastName);
            case 'activity-desc':
                const activitiesA = userManager.getUserActivities(a.id).length;
                const activitiesB = userManager.getUserActivities(b.id).length;
                return activitiesB - activitiesA;
            default:
                return 0;
        }
    });
    
    loadUsersTable(users);
}

// Activity filtering
function filterActivities() {
    const actionFilter = document.getElementById('activityFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let activities = userManager.getUserActivities();
    
    // Filter by action
    if (actionFilter !== 'all') {
        activities = activities.filter(activity => activity.action === actionFilter);
    }
    
    // Filter by date
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        activities = activities.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate.toDateString() === filterDate.toDateString();
        });
    }
    
    loadActivitiesTable(activities);
}

// View user details
function viewUserDetails(userId) {
    const user = userManager.getAllUsers().find(u => u.id === userId);
    if (!user) return;
    
    const activities = userManager.getUserActivities(userId);
    const cartItems = getCartItemsForUser(userId);
    const wishlistItems = getWishlistItemsForUser(userId);
    
    const modal = document.getElementById('userDetailModal');
    const content = document.getElementById('userDetailContent');
    
    content.innerHTML = `
        <div class="user-detail-section">
            <h3>👤 Personal Information</h3>
            <div class="user-detail-grid">
                <div class="detail-item">
                    <label>Name:</label>
                    <span>${user.firstName} ${user.lastName}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${user.email}</span>
                </div>
                <div class="detail-item">
                    <label>Role:</label>
                    <span>${user.role || 'customer'}</span>
                </div>
                <div class="detail-item">
                    <label>Birth Date:</label>
                    <span>${user.birthDate || 'Not provided'}</span>
                </div>
                <div class="detail-item">
                    <label>Newsletter:</label>
                    <span>${user.newsletter ? 'Subscribed' : 'Not subscribed'}</span>
                </div>
                <div class="detail-item">
                    <label>Registration:</label>
                    <span>${formatDate(user.createdAt)}</span>
                </div>
                <div class="detail-item">
                    <label>Last Login:</label>
                    <span>${formatDate(user.lastLogin)}</span>
                </div>
            </div>
        </div>

        <div class="user-detail-section">
            <h3>🛒 Current Cart (${cartItems.length} items)</h3>
            <div class="cart-items-detail">
                ${cartItems.length > 0 ? cartItems.map(item => `
                    <div class="cart-item-detail">
                        <span>${item.name}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('') : '<p>Cart is empty</p>'}
            </div>
        </div>

        <div class="user-detail-section">
            <h3>❤️ Wishlist (${wishlistItems.length} items)</h3>
            <div class="wishlist-items-detail">
                ${wishlistItems.length > 0 ? wishlistItems.map(item => `
                    <div class="wishlist-item-detail">
                        <span>${item.name}</span>
                        <span>$${item.price.toFixed(2)}</span>
                    </div>
                `).join('') : '<p>Wishlist is empty</p>'}
            </div>
        </div>

        <div class="user-detail-section">
            <h3>📊 Recent Activities (${activities.length} total)</h3>
            <div class="activities-detail">
                ${activities.slice(0, 10).map(activity => `
                    <div class="activity-detail">
                        <span class="activity-icon">${getActivityIcon(activity.action)}</span>
                        <span class="activity-text">${formatActivityAction(activity.action)}</span>
                        <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
                    </div>
                `).join('')}
                ${activities.length > 10 ? `<p class="more-activities">... and ${activities.length - 10} more</p>` : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userDetailModal').style.display = 'none';
}

// Message user
function messageUser(userId) {
    const user = userManager.getAllUsers().find(u => u.id === userId);
    if (!user) return;
    
    const message = prompt(`Send a message to ${user.firstName} ${user.lastName}:`);
    if (message) {
        // In a real application, this would send an email or notification
        alert(`Message sent to ${user.firstName}: "${message}"`);
    }
}

// Data management functions
function exportUserData() {
    const data = {
        users: userManager.getAllUsers(),
        activities: userManager.getUserActivities(),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `colp-user-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCartNotification('User data exported successfully!', 'success');
}

function clearOldActivities() {
    if (confirm('Are you sure you want to clear activities older than 30 days? This cannot be undone.')) {
        const activities = userManager.getUserActivities();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const recentActivities = activities.filter(activity => 
            new Date(activity.timestamp) > thirtyDaysAgo
        );
        
        localStorage.setItem('colp-user-activities', JSON.stringify(recentActivities));
        showCartNotification('Old activities cleared successfully!', 'success');
        loadDashboard();
    }
}

function optimizeStorage() {
    // Remove duplicate activities and optimize storage
    const activities = userManager.getUserActivities();
    const uniqueActivities = activities.filter((activity, index, self) => 
        index === self.findIndex(a => 
            a.userId === activity.userId && 
            a.action === activity.action && 
            Math.abs(new Date(a.timestamp) - new Date(activity.timestamp)) < 1000
        )
    );
    
    localStorage.setItem('colp-user-activities', JSON.stringify(uniqueActivities));
    
    showCartNotification(`Storage optimized! Removed ${activities.length - uniqueActivities.length} duplicate entries.`, 'success');
    loadDashboard();
}

function generateReport() {
    const data = adminManager.getDashboardData();
    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalUsers: data.totalUsers,
            totalActivities: data.totalActivities,
            activeOrders: data.activeOrders,
            totalRevenue: data.totalRevenue
        },
        userGrowth: calculateUserGrowth(data.users),
        popularProducts: getPopularProductsData(),
        recentActivity: data.activities.slice(0, 50)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `colp-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCartNotification('Analytics report generated!', 'success');
}

// Admin Management Functions
function loadAdminsTable() {
    const tbody = document.getElementById('adminsTableBody');
    if (!tbody) return;

    const users = userManager.getAllUsers();
    const admins = users.filter(user => userManager.isAdmin(user));
    
    tbody.innerHTML = '';

    if (admins.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No admins found</td>
            </tr>
        `;
        return;
    }

    admins.forEach(admin => {
        const row = document.createElement('tr');
        const canRemove = adminManager.isSuperAdmin() && admin.email !== 'admin@colp.co';
        
        row.innerHTML = `
            <td>
                <div class="user-info">
                    <div class="user-avatar">🔐</div>
                    <div>
                        <div class="user-name">${admin.firstName} ${admin.lastName}</div>
                        <div class="user-role">${admin.role || 'admin'}</div>
                    </div>
                </div>
            </td>
            <td>${admin.email}</td>
            <td>
                <span class="role-badge ${admin.role === 'super_admin' ? 'super-admin' : 'admin'}">${admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
            </td>
            <td>${formatDate(admin.createdAt)}</td>
            <td>${formatDate(admin.lastLogin)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewUserDetails('${admin.id}')">👁️ View</button>
                    ${canRemove ? `<button class="btn-danger" onclick="removeAdmin('${admin.id}')">🗑️ Remove</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddAdminModal() {
    if (!adminManager.isSuperAdmin()) {
        showCartNotification('Only super admins can add new admins.', 'error');
        return;
    }
    document.getElementById('addAdminModal').style.display = 'flex';
}

function closeAddAdminModal() {
    document.getElementById('addAdminModal').style.display = 'none';
    document.getElementById('addAdminForm').reset();
}

function handleAddAdmin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const adminData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        isFirstLogin: true
    };
    
    const result = userManager.registerUser(adminData);
    
    if (result.success) {
        showCartNotification('Admin added successfully!', 'success');
        closeAddAdminModal();
        loadAdminsTable();
    } else {
        showCartNotification(result.message, 'error');
    }
}

function removeAdmin(adminId) {
    if (!adminManager.isSuperAdmin()) {
        showCartNotification('Only super admins can remove admins.', 'error');
        return;
    }
    
    const users = userManager.getAllUsers();
    const admin = users.find(u => u.id === adminId);
    
    if (!admin) return;
    
    if (admin.email === 'admin@colp.co') {
        showCartNotification('Cannot remove the main super admin.', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to remove admin ${admin.firstName} ${admin.lastName}?`)) {
        const updatedUsers = users.filter(u => u.id !== adminId);
        localStorage.setItem('colp-users', JSON.stringify(updatedUsers));
        
        showCartNotification('Admin removed successfully!', 'success');
        loadAdminsTable();
    }
}

// Newsletter Management Functions
function loadNewsletterTable() {
    const tbody = document.getElementById('newsletterTableBody');
    if (!tbody) return;

    const subscribers = newsletterManager.getSubscribers();
    const users = userManager.getAllUsers();
    
    tbody.innerHTML = '';

    if (subscribers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="no-data">No newsletter subscribers found</td>
            </tr>
        `;
        return;
    }

    subscribers.forEach(subscriber => {
        const user = users.find(u => u.email === subscriber.email);
        const userStatus = user ? 'Registered User' : 'Subscriber Only';
        const statusClass = user ? 'user-registered' : 'subscriber-only';
        
        if (subscriber.active) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subscriber.email}</td>
                <td>${formatDate(subscriber.subscribedAt)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${userStatus}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="viewSubscriberDetails('${subscriber.id}')">👁️ View</button>
                        <button class="btn-danger" onclick="removeNewsletterSubscriber('${subscriber.email}')">🗑️ Remove</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        }
    });

    // Update stats
    updateNewsletterStats(subscribers);
}

function updateNewsletterStats(subscribers) {
    const totalSubscribers = subscribers.filter(sub => sub.active).length;
    const activeSubscribers = totalSubscribers; // For now, all active subscribers
    
    document.getElementById('totalSubscribers').textContent = totalSubscribers;
    document.getElementById('activeSubscribers').textContent = activeSubscribers;
}

function filterNewsletterSubscribers() {
    const searchTerm = document.getElementById('newsletterSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#newsletterTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function viewSubscriberDetails(subscriberId) {
    const subscribers = newsletterManager.getSubscribers();
    const subscriber = subscribers.find(sub => sub.id === subscriberId);
    
    if (!subscriber) return;
    
    const modal = document.getElementById('userDetailModal');
    const content = document.getElementById('userDetailContent');
    
    content.innerHTML = `
        <div class="user-detail-section">
            <h3>📧 Subscriber Information</h3>
            <div class="user-detail-grid">
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${subscriber.email}</span>
                </div>
                <div class="detail-item">
                    <label>Subscribed:</label>
                    <span>${formatDate(subscriber.subscribedAt)}</span>
                </div>
                <div class="detail-item">
                    <label>Source:</label>
                    <span>${subscriber.source}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span>${subscriber.active ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
        </div>
        
        <div class="user-detail-section">
            <h3>📨 Preferences</h3>
            <div class="preferences-list">
                <div class="preference-item">
                    <span>Promotions:</span>
                    <span>${subscriber.preferences?.promotions ? '✅' : '❌'}</span>
                </div>
                <div class="preference-item">
                    <span>New Arrivals:</span>
                    <span>${subscriber.preferences?.newArrivals ? '✅' : '❌'}</span>
                </div>
                <div class="preference-item">
                    <span>Stories:</span>
                    <span>${subscriber.preferences?.stories ? '✅' : '❌'}</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function removeNewsletterSubscriber(email) {
    if (confirm(`Are you sure you want to remove ${email} from the newsletter?`)) {
        newsletterManager.removeSubscriber(email);
        loadNewsletterTable();
        showCartNotification('Subscriber removed successfully!', 'success');
    }
}

function sendNewsletterToAll() {
    document.getElementById('newsletterModal').style.display = 'flex';
    
    // Update recipient count
    const subscribers = newsletterManager.getSubscribers();
    const activeCount = subscribers.filter(sub => sub.active).length;
    document.getElementById('recipientCount').textContent = activeCount;
}

function closeNewsletterModal() {
    document.getElementById('newsletterModal').style.display = 'none';
    document.getElementById('newsletterForm').reset();
}

function handleSendNewsletter(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const subject = formData.get('subject');
    const content = formData.get('content');
    const includePromo = formData.get('includePromo') === 'on';
    
    const subscribers = newsletterManager.getSubscribers();
    const activeSubscribers = subscribers.filter(sub => sub.active);
    
    // Simulate sending newsletter
    console.log('Sending newsletter to:', activeSubscribers.length, 'subscribers');
    console.log('Subject:', subject);
    console.log('Content:', content);
    console.log('Include Promo:', includePromo);
    
    // Store newsletter in history
    const newsletters = JSON.parse(localStorage.getItem('colp-newsletters')) || [];
    newsletters.push({
        id: 'newsletter_' + Date.now(),
        subject: subject,
        content: content,
        includePromo: includePromo,
        sentAt: new Date().toISOString(),
        recipientCount: activeSubscribers.length
    });
    localStorage.setItem('colp-newsletters', JSON.stringify(newsletters));
    
    showCartNotification(`Newsletter sent to ${activeSubscribers.length} subscribers!`, 'success');
    closeNewsletterModal();
}

function exportNewsletterData() {
    const subscribers = newsletterManager.getSubscribers();
    const newsletters = JSON.parse(localStorage.getItem('colp-newsletters')) || [];
    
    const data = {
        subscribers: subscribers,
        newsletters: newsletters,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `colp-newsletter-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCartNotification('Newsletter data exported successfully!', 'success');
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
}

function getActivityIcon(action) {
    const icons = {
        login: '🔑',
        register: '👤',
        logout: '🚪',
        add_to_cart: '🛒',
        remove_from_cart: '🗑️',
        add_to_wishlist: '❤️',
        remove_from_wishlist: '💔',
        page_view: '👁️',
        order_completed: '✅'
    };
    return icons[action] || '📝';
}

function formatActivityAction(action) {
    const actions = {
        login: 'Logged in',
        register: 'Registered',
        logout: 'Logged out',
        add_to_cart: 'Added to cart',
        remove_from_cart: 'Removed from cart',
        add_to_wishlist: 'Added to wishlist',
        remove_from_wishlist: 'Removed from wishlist',
        page_view: 'Viewed page',
        order_completed: 'Completed order'
    };
    return actions[action] || action;
}

function formatActivityDetails(activity) {
    if (activity.data.productId) {
        const productName = getProductName(activity.data.productId);
        return `Product: ${productName}`;
    }
    if (activity.page) {
        return `Page: ${activity.page}`;
    }
    return '';
}

function getProductName(productId) {
    const productNames = {
        'dragon-ring': "Dragon's Ember Ring",
        'moonstone-pendant': 'Elven Moonstone Pendant',
        'crystal-brooch': 'Mystical Crystal Brooch',
        'phoenix-earrings': 'Phoenix Feather Earrings',
        'guardian-ring': "Guardian's Seal Ring",
        'forest-necklace': 'Forest Spirit Necklace',
        'starlight-brooch': 'Starlight Compass Brooch',
        'wizard-cufflinks': "Wizard's Formal Cufflinks"
    };
    return productNames[productId] || productId;
}

function getCartItemsForUser(userId) {
    // In a real application, this would track individual user carts
    // For now, return current cart if user is logged in
    const currentUser = userManager.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        return JSON.parse(localStorage.getItem('colp-cart')) || [];
    }
    return [];
}

function getWishlistItemsForUser(userId) {
    // In a real application, this would track individual user wishlists
    // For now, return current wishlist if user is logged in
    const currentUser = userManager.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        const wishlist = wishlistManager.getWishlist();
        return wishlistManager.getWishlistProducts();
    }
    return [];
}

function calculateUserGrowth(users) {
    const now = new Date();
    const periods = {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: users.length
    };
    
    users.forEach(user => {
        const userDate = new Date(user.createdAt);
        const diffDays = (now - userDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays < 1) periods.today++;
        if (diffDays < 7) periods.thisWeek++;
        if (diffDays < 30) periods.thisMonth++;
    });
    
    return periods;
}

function getPopularProductsData() {
    const activities = userManager.getUserActivities();
    const productStats = {};
    
    activities.forEach(activity => {
        if (activity.action === 'add_to_cart' && activity.data.productId) {
            const productId = activity.data.productId;
            productStats[productId] = (productStats[productId] || 0) + 1;
        }
    });
    
    return Object.entries(productStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([productId, count]) => ({
            productId,
            productName: getProductName(productId),
            addToCartCount: count
        }));
}

// Newsletter and promotion functions
function sendNewsletterModal() {
    const message = prompt('Enter newsletter content:');
    if (message) {
        const users = userManager.getAllUsers().filter(user => user.newsletter);
        showCartNotification(`Newsletter sent to ${users.length} subscribers!`, 'success');
    }
}

function sendPromotionModal() {
    const message = prompt('Enter promotion details:');
    if (message) {
        const users = userManager.getAllUsers();
        showCartNotification(`Promotion sent to ${users.length} users!`, 'success');
    }
}