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
        return orders.filter(order => order.status === 'active' || order.status === 'pending').length;
    },

    // Stock management functions
    getStockData() {
        // Get stock data from localStorage or initialize default stock
        let stockData = JSON.parse(localStorage.getItem('colp-stock-data')) || {};
        
        // If no stock data exists, initialize with default product data
        if (Object.keys(stockData).length === 0) {
            stockData = this.initializeDefaultStock();
            localStorage.setItem('colp-stock-data', JSON.stringify(stockData));
        }
        
        return stockData;
    },

    initializeDefaultStock() {
        const defaultProducts = {
            'dragon-ring': { name: 'Dragon\'s Ember Ring', stock: 15, price: 89.99, status: 'available', category: 'rings' },
            'moonstone-pendant': { name: 'Elven Moonstone Pendant', stock: 8, price: 124.99, status: 'available', category: 'necklaces' },
            'crystal-brooch': { name: 'Mystical Crystal Brooch', stock: 0, price: 156.99, status: 'available', category: 'brooches' },
            'guardian-ring': { name: 'Guardian\'s Seal Ring', stock: 12, price: 178.99, status: 'available', category: 'rings' },
            'forest-necklace': { name: 'Forest Spirit Necklace', stock: 6, price: 142.99, status: 'available', category: 'necklaces' },
            'starlight-brooch': { name: 'Starlight Compass Brooch', stock: 20, price: 198.99, status: 'available', category: 'brooches' },
            'wizard-cufflinks': { name: 'Wizard\'s Formal Cufflinks', stock: 0, price: 267.99, status: 'available', category: 'formal' },
            'wizard-tower-ring': { name: 'Wizard Tower Ring', stock: 12, price: 134.99, status: 'available', category: 'rings' },
            'hero-pendant': { name: 'Hero\'s Legacy Pendant', stock: 6, price: 189.99, status: 'available', category: 'necklaces' },
            'geometric-phoenix-brooch': { name: 'Geometric Phoenix Brooch', stock: 13, price: 167.99, status: 'available', category: 'brooches' },
            'phoenix-earrings': { name: 'Phoenix Feather Earrings', stock: 5, price: 203.99, status: 'available', category: 'earrings' },
            'leaf-earrings': { name: 'Enchanted Leaf Earrings', stock: 15, price: 94.99, status: 'available', category: 'earrings' },
            'crystal-earrings': { name: 'Low Poly Crystal Earrings', stock: 8, price: 112.99, status: 'available', category: 'earrings' },
            'noble-tie-pin': { name: 'Noble\'s Tie Pin', stock: 10, price: 156.99, status: 'available', category: 'formal' },
            'castle-cufflinks': { name: 'Castle Monument Cufflinks', stock: 7, price: 234.99, status: 'available', category: 'formal' }
        };
        return defaultProducts;
    },

    updateProductStock(productId, newStock, status = 'available', notes = '') {
        const stockData = this.getStockData();
        if (stockData[productId]) {
            stockData[productId].stock = parseInt(newStock);
            stockData[productId].status = status;
            stockData[productId].lastUpdated = new Date().toISOString();
            if (notes) stockData[productId].notes = notes;
            
            localStorage.setItem('colp-stock-data', JSON.stringify(stockData));
            
            // Update product cards in the DOM if they exist
            this.updateProductCardsStock(productId, newStock, status);
            
            return true;
        }
        return false;
    },

    updateProductCardsStock(productId, newStock, status) {
        // Update all product cards with this product ID
        const productCards = document.querySelectorAll(`[data-product-id="${productId}"]`);
        productCards.forEach(card => {
            card.setAttribute('data-stock', newStock);
            
            // Update stock badge
            const stockBadge = card.querySelector('.product-stock-badge');
            if (stockBadge) {
                if (newStock <= 0) {
                    stockBadge.textContent = 'Out of Stock';
                    stockBadge.className = 'product-stock-badge stock-out';
                } else if (newStock <= 5) {
                    stockBadge.textContent = `Only ${newStock} left!`;
                    stockBadge.className = 'product-stock-badge stock-low';
                } else {
                    stockBadge.textContent = `${newStock} in stock`;
                    stockBadge.className = 'product-stock-badge';
                }
            }

            // Update add to cart button
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (addToCartBtn) {
                if (newStock <= 0 || status !== 'available') {
                    addToCartBtn.disabled = true;
                    if (status === 'coming-soon') {
                        addToCartBtn.textContent = 'Coming Soon';
                        addToCartBtn.className = 'add-to-cart coming-soon';
                    } else {
                        addToCartBtn.textContent = 'Out of Stock';
                        addToCartBtn.className = 'add-to-cart out-of-stock';
                    }
                } else {
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = 'Add to Cart';
                    addToCartBtn.className = 'add-to-cart';
                }
            }
        });
        
        // Broadcast stock update to other windows/tabs using localStorage
        this.broadcastStockUpdate(productId, newStock, status);
    },
    
    // New function to broadcast stock updates across browser tabs
    broadcastStockUpdate(productId, newStock, status) {
        const updateEvent = {
            type: 'stock-update',
            productId: productId,
            stock: newStock,
            status: status,
            timestamp: new Date().toISOString()
        };
        
        // Use localStorage to communicate between tabs
        localStorage.setItem('colp-stock-update', JSON.stringify(updateEvent));
        
        // Remove the event after a short delay to trigger change event
        setTimeout(() => {
            localStorage.removeItem('colp-stock-update');
        }, 100);
    },

    getStockStatus(stock, status) {
        if (status === 'coming-soon') return 'Coming Soon';
        if (status === 'discontinued') return 'Discontinued';
        if (stock <= 0) return 'Out of Stock';
        if (stock <= 5) return 'Low Stock';
        return 'In Stock';
    },

    getStockStatusClass(stock, status) {
        if (status === 'coming-soon') return 'status-coming-soon';
        if (status === 'discontinued') return 'status-discontinued';
        if (stock <= 0) return 'status-out-of-stock';
        if (stock <= 5) return 'status-low-stock';
        return 'status-in-stock';
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
    
    // Listen for stock updates from admin panel (cross-tab communication)
    window.addEventListener('storage', function(e) {
        if (e.key === 'colp-stock-update' && e.newValue) {
            try {
                const updateEvent = JSON.parse(e.newValue);
                if (updateEvent.type === 'stock-update') {
                    // Update product cards if they exist on current page
                    if (typeof adminManager !== 'undefined') {
                        adminManager.updateProductCardsStock(
                            updateEvent.productId, 
                            updateEvent.stock, 
                            updateEvent.status
                        );
                    }
                    
                    // Update homepage and products page displays if functions exist
                    if (typeof updateProductDisplay === 'function') {
                        updateProductDisplay(updateEvent.productId, updateEvent.stock, updateEvent.status);
                    }
                }
            } catch (error) {
                console.log('Error processing stock update:', error);
            }
        }
    });
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
    
    // Load admins table
    loadAdminsTable();
    
    // Load newsletter data
    loadNewsletterTable();
    
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
        if (activity.action === 'add_to_cart' && activity.details && activity.details.productId) {
            const productId = activity.details.productId;
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
            <div class="cart-items-list">
                ${cartItems.map(item => `
                    <div class="cart-item-detail">
                        <span>${item.name} - $${item.price} (Qty: ${item.quantity})</span>
                    </div>
                `).join('') || '<p>No items in cart</p>'}
            </div>
        </div>

        <div class="user-detail-section">
            <h3>❤️ Wishlist (${wishlistItems.length} items)</h3>
            <div class="wishlist-items-list">
                ${wishlistItems.map(item => `
                    <div class="wishlist-item-detail">
                        <span>${item.name} - $${item.price}</span>
                    </div>
                `).join('') || '<p>No items in wishlist</p>'}
            </div>
        </div>

        <div class="user-detail-section">
            <h3>📊 Recent Activities (${activities.length} total)</h3>
            <div class="activities-list">
                ${activities.slice(0, 10).map(activity => `
                    <div class="activity-item">
                        <span class="activity-action">${activity.action}</span>
                        <span class="activity-details">${activity.details || ''}</span>
                        <span class="activity-time">${formatDate(activity.timestamp)}</span>
                    </div>
                `).join('') || '<p>No recent activities</p>'}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Admin Tab Management Functions
function switchAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback for programmatic calls
        document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`)?.classList.add('active');
    }
    
    // Load data for specific tabs
    switch(tabName) {
        case 'users':
            loadUsersTable();
            break;
        case 'activities':
            const activities = userManager.getUserActivities();
            loadActivitiesTable(activities);
            break;
        case 'analytics':
            loadAnalytics(adminManager.getDashboardData());
            break;
        case 'admins':
            loadAdminsTable();
            // Show/hide add admin button based on permissions
            const addAdminBtn = document.getElementById('addAdminBtn');
            if (addAdminBtn) {
                addAdminBtn.style.display = adminManager.isSuperAdmin() ? 'block' : 'none';
            }
            break;
        case 'stock':
            loadStockTable();
            break;
        case 'newsletter':
            loadNewsletterTable();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

function loadStockTable() {
    const stockData = adminManager.getStockData();
    const tbody = document.getElementById('stockTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.entries(stockData).forEach(([productId, product]) => {
        const row = document.createElement('tr');
        const statusClass = adminManager.getStockStatusClass(product.stock, product.status);
        const statusText = adminManager.getStockStatus(product.stock, product.status);
        
        row.innerHTML = `
            <td>
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <small>ID: ${productId}</small>
                </div>
            </td>
            <td class="stock-amount">${product.stock}</td>
            <td>
                <span class="stock-status ${statusClass}">${statusText}</span>
            </td>
            <td class="product-price">$${product.price}</td>
            <td class="stock-actions">
                <button class="btn-small btn-primary" onclick="openStockUpdateModal('${productId}')">
                    ✏️ Edit
                </button>
                <button class="btn-small btn-secondary" onclick="quickStockAdjust('${productId}', 'add')">
                    ➕ Add
                </button>
                <button class="btn-small btn-secondary" onclick="quickStockAdjust('${productId}', 'subtract')">
                    ➖ Remove
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function filterStockItems() {
    const searchTerm = document.getElementById('stockSearch').value.toLowerCase();
    const filterSelect = document.getElementById('stockFilter').value;
    const stockData = adminManager.getStockData();
    
    let filteredData = Object.entries(stockData);
    
    // Filter by search term
    if (searchTerm) {
        filteredData = filteredData.filter(([id, product]) => 
            product.name.toLowerCase().includes(searchTerm) ||
            id.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by stock status
    if (filterSelect !== 'all') {
        filteredData = filteredData.filter(([id, product]) => {
            switch (filterSelect) {
                case 'in-stock':
                    return product.stock > 5 && product.status === 'available';
                case 'low-stock':
                    return product.stock <= 5 && product.stock > 0 && product.status === 'available';
                case 'out-of-stock':
                    return product.stock <= 0 || product.status !== 'available';
                default:
                    return true;
            }
        });
    }
    
    // Rebuild table with filtered data
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';
    
    filteredData.forEach(([productId, product]) => {
        const row = document.createElement('tr');
        const statusClass = adminManager.getStockStatusClass(product.stock, product.status);
        const statusText = adminManager.getStockStatus(product.stock, product.status);
        
        row.innerHTML = `
            <td>
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <small>ID: ${productId}</small>
                </div>
            </td>
            <td class="stock-amount">${product.stock}</td>
            <td>
                <span class="stock-status ${statusClass}">${statusText}</span>
            </td>
            <td class="product-price">$${product.price}</td>
            <td class="stock-actions">
                <button class="btn-small btn-primary" onclick="openStockUpdateModal('${productId}')">
                    ✏️ Edit
                </button>
                <button class="btn-small btn-secondary" onclick="quickStockAdjust('${productId}', 'add')">
                    ➕ Add
                </button>
                <button class="btn-small btn-secondary" onclick="quickStockAdjust('${productId}', 'subtract')">
                    ➖ Remove
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function filterStockByStatus() {
    filterStockItems();
}

function openStockUpdateModal(productId) {
    const stockData = adminManager.getStockData();
    const product = stockData[productId];
    
    if (!product) return;
    
    document.getElementById('stockProductName').value = product.name;
    document.getElementById('stockProductId').value = productId;
    document.getElementById('stockCurrentAmount').value = product.stock;
    document.getElementById('stockNewAmount').value = product.stock;
    document.getElementById('stockStatus').value = product.status || 'available';
    document.getElementById('stockNotes').value = product.notes || '';
    
    document.getElementById('stockUpdateModal').style.display = 'block';
}

function closeStockUpdateModal() {
    document.getElementById('stockUpdateModal').style.display = 'none';
}

function handleStockUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productId = formData.get('productId');
    const newStock = parseInt(formData.get('newStock'));
    const status = formData.get('status');
    const notes = formData.get('notes');
    
    if (adminManager.updateProductStock(productId, newStock, status, notes)) {
        showNotification('Stock updated successfully!', 'success');
        loadStockTable();
        closeStockUpdateModal();
    } else {
        showNotification('Failed to update stock', 'error');
    }
}

function quickStockAdjust(productId, action) {
    const stockData = adminManager.getStockData();
    const product = stockData[productId];
    
    if (!product) return;
    
    let newStock = product.stock;
    if (action === 'add') {
        newStock += 1;
    } else if (action === 'subtract' && newStock > 0) {
        newStock -= 1;
    }
    
    if (adminManager.updateProductStock(productId, newStock, product.status)) {
        loadStockTable();
        showNotification(`Stock ${action === 'add' ? 'increased' : 'decreased'} for ${product.name}`, 'success');
    }
}

function openBulkUpdateModal() {
    document.getElementById('bulkUpdateModal').style.display = 'block';
    updateBulkAffectedCount();
}

function closeBulkUpdateModal() {
    document.getElementById('bulkUpdateModal').style.display = 'none';
}

function toggleBulkUpdateFields() {
    const updateType = document.getElementById('bulkUpdateType').value;
    const amountGroup = document.getElementById('bulkAmountGroup');
    const statusGroup = document.getElementById('bulkStatusGroup');
    
    if (updateType === 'status') {
        amountGroup.style.display = 'none';
        statusGroup.style.display = 'block';
    } else {
        amountGroup.style.display = 'block';
        statusGroup.style.display = 'none';
    }
    
    updateBulkAffectedCount();
}

function updateBulkAffectedCount() {
    const checkboxes = document.querySelectorAll('input[name="categories"]:checked');
    const selectedCategories = Array.from(checkboxes).map(cb => cb.value);
    
    const stockData = adminManager.getStockData();
    const affectedProducts = Object.values(stockData).filter(product => 
        selectedCategories.length === 0 || selectedCategories.includes(product.category)
    );
    
    document.getElementById('bulkAffectedCount').textContent = affectedProducts.length;
}

function handleBulkUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updateType = formData.get('updateType');
    const amount = parseInt(formData.get('amount')) || 0;
    const status = formData.get('status');
    
    const checkboxes = document.querySelectorAll('input[name="categories"]:checked');
    const selectedCategories = Array.from(checkboxes).map(cb => cb.value);
    
    const stockData = adminManager.getStockData();
    let updatedCount = 0;
    
    Object.entries(stockData).forEach(([productId, product]) => {
        if (selectedCategories.length === 0 || selectedCategories.includes(product.category)) {
            let newStock = product.stock;
            let newStatus = product.status;
            
            switch (updateType) {
                case 'add':
                    newStock += amount;
                    break;
                case 'subtract':
                    newStock = Math.max(0, newStock - amount);
                    break;
                case 'set':
                    newStock = amount;
                    break;
                case 'status':
                    newStatus = status;
                    break;
            }
            
            if (adminManager.updateProductStock(productId, newStock, newStatus)) {
                updatedCount++;
            }
        }
    });
    
    showNotification(`Bulk update applied to ${updatedCount} products`, 'success');
    loadStockTable();
    closeBulkUpdateModal();
}

// Load additional tab data functions
function loadAdminsTable() {
    const tbody = document.getElementById('adminsTableBody');
    if (!tbody) return;
    
    const users = userManager.getAllUsers();
    const admins = users.filter(user => userManager.isAdmin(user));
    
    tbody.innerHTML = '';
    
    if (admins.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No admin users found</td>
            </tr>
        `;
        return;
    }
    
    admins.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="admin-info">
                    <strong>${admin.firstName} ${admin.lastName}</strong>
                    <small>${admin.role || 'admin'}</small>
                </div>
            </td>
            <td>${admin.email}</td>
            <td>
                <span class="role-badge ${admin.role === 'super_admin' ? 'super-admin' : 'admin'}">
                    ${admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
            </td>
            <td>${formatDate(admin.createdAt)}</td>
            <td>${formatDate(admin.lastLogin)}</td>
            <td class="admin-actions">
                <button class="btn-small btn-secondary" onclick="viewUserDetails('${admin.id}')">
                    👁️ View
                </button>
                ${adminManager.isSuperAdmin() && admin.role !== 'super_admin' ? 
                    `<button class="btn-small btn-danger" onclick="removeAdmin('${admin.id}')">
                        🗑️ Remove
                    </button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadNewsletterTable() {
    const tbody = document.getElementById('newsletterTableBody');
    if (!tbody) return;
    
    const subscribers = newsletterManager.getSubscribers();
    const totalSubscribersElement = document.getElementById('totalSubscribers');
    const activeSubscribersElement = document.getElementById('activeSubscribers');
    
    if (totalSubscribersElement) totalSubscribersElement.textContent = subscribers.length;
    if (activeSubscribersElement) activeSubscribersElement.textContent = subscribers.filter(s => s.active).length;
    
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
        const users = userManager.getAllUsers();
        const matchingUser = users.find(user => user.email === subscriber.email);
        const userStatus = matchingUser ? 'Registered User' : 'Newsletter Only';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subscriber.email}</td>
            <td>${formatDate(subscriber.subscribedAt)}</td>
            <td>
                <span class="user-status ${matchingUser ? 'registered' : 'newsletter-only'}">
                    ${userStatus}
                </span>
            </td>
            <td class="admin-actions">
                ${matchingUser ? 
                    `<button class="btn-small btn-secondary" onclick="viewUserDetails('${matchingUser.id}')">
                        👁️ View User
                    </button>` : ''}
                <button class="btn-small btn-danger" onclick="unsubscribeUser('${subscriber.email}')">
                    📧 Unsubscribe
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadAnalytics() {
    const popularProductsElement = document.getElementById('popularProducts');
    const activityTimelineElement = document.getElementById('activityTimeline');
    const cartAnalyticsElement = document.getElementById('cartAnalytics');
    const userDemographicsElement = document.getElementById('userDemographics');
    
    if (popularProductsElement) {
        const activities = userManager.getUserActivities();
        const productCounts = {};
        
        activities.filter(a => a.action === 'add_to_cart').forEach(activity => {
            const productId = activity.details?.productId;
            if (productId) {
                productCounts[productId] = (productCounts[productId] || 0) + 1;
            }
        });
        
        const sortedProducts = Object.entries(productCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
            
        popularProductsElement.innerHTML = sortedProducts.length > 0 ? 
            sortedProducts.map(([productId, count]) => 
                `<div class="analytics-item">
                    <span>${productId}</span>
                    <span>${count} times added</span>
                </div>`
            ).join('') : '<p>No product data available</p>';
    }
    
    if (activityTimelineElement) {
        const activities = userManager.getUserActivities().slice(-10);
        activityTimelineElement.innerHTML = activities.length > 0 ?
            activities.map(activity => 
                `<div class="activity-timeline-item">
                    <span class="activity-time">${formatDate(activity.timestamp)}</span>
                    <span class="activity-desc">${activity.action} - ${activity.details?.productId || 'N/A'}</span>
                </div>`
            ).join('') : '<p>No recent activity</p>';
    }
    
    if (cartAnalyticsElement) {
        const users = userManager.getAllUsers();
        const usersWithCartItems = users.filter(user => {
            const cart = JSON.parse(localStorage.getItem(`colp-cart-${user.id}`)) || [];
            return cart.length > 0;
        }).length;
        
        cartAnalyticsElement.innerHTML = `
            <div class="analytics-stat">
                <span>Users with items in cart:</span>
                <span>${usersWithCartItems}</span>
            </div>
            <div class="analytics-stat">
                <span>Cart abandonment rate:</span>
                <span>${users.length > 0 ? Math.round((usersWithCartItems / users.length) * 100) : 0}%</span>
            </div>
        `;
    }
    
    if (userDemographicsElement) {
        const users = userManager.getAllUsers();
        const newsletterSubscribers = newsletterManager.getSubscribers().filter(s => s.active);
        
        userDemographicsElement.innerHTML = `
            <div class="analytics-stat">
                <span>Total registered users:</span>
                <span>${users.length}</span>
            </div>
            <div class="analytics-stat">
                <span>Newsletter subscribers:</span>
                <span>${newsletterSubscribers.length}</span>
            </div>
            <div class="analytics-stat">
                <span>Conversion rate:</span>
                <span>${newsletterSubscribers.length > 0 ? Math.round((users.length / newsletterSubscribers.length) * 100) : 0}%</span>
            </div>
        `;
    }
}

function loadSettingsData() {
    // Settings data is static, no loading needed
    console.log('Settings tab loaded');
}

// Newsletter Management Functions
const newsletterManager = {
    getSubscribers() {
        return JSON.parse(localStorage.getItem('colp-newsletter-subscribers')) || [];
    },
    
    saveSubscribers(subscribers) {
        localStorage.setItem('colp-newsletter-subscribers', JSON.stringify(subscribers));
    },
    
    addSubscriber(email) {
        const subscribers = this.getSubscribers();
        const existing = subscribers.find(s => s.email === email);
        
        if (!existing) {
            subscribers.push({
                id: 'sub_' + Date.now(),
                email: email,
                subscribedAt: new Date().toISOString(),
                active: true
            });
            this.saveSubscribers(subscribers);
        }
    },
    
    unsubscribe(email) {
        const subscribers = this.getSubscribers();
        const index = subscribers.findIndex(s => s.email === email);
        
        if (index !== -1) {
            subscribers[index].active = false;
            this.saveSubscribers(subscribers);
        }
    },
    
    removeSubscriber(email) {
        const subscribers = this.getSubscribers();
        const filteredSubscribers = subscribers.filter(s => s.email !== email);
        this.saveSubscribers(filteredSubscribers);
    }
};

// Admin action functions
function removeAdmin(userId) {
    if (!adminManager.isSuperAdmin()) {
        alert('Only super admins can remove admin privileges');
        return;
    }
    
    if (confirm('Are you sure you want to remove admin privileges from this user?')) {
        const users = userManager.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].role = 'customer';
            localStorage.setItem('colp-users', JSON.stringify(users));
            loadAdminsTable();
            showNotification('Admin privileges removed successfully', 'success');
        }
    }
}

function unsubscribeUser(email) {
    if (confirm(`Are you sure you want to unsubscribe ${email} from the newsletter?`)) {
        newsletterManager.unsubscribe(email);
        loadNewsletterTable();
        showNotification('User unsubscribed successfully', 'success');
    }
}

function sendNewsletterToAll() {
    const subscribers = newsletterManager.getSubscribers().filter(s => s.active);
    if (subscribers.length === 0) {
        alert('No active subscribers found');
        return;
    }
    
    if (confirm(`Send newsletter to ${subscribers.length} subscribers?`)) {
        // In a real app, this would send emails
        showNotification(`Newsletter would be sent to ${subscribers.length} subscribers`, 'info');
    }
}

// Settings functions
function exportUserData() {
    const users = userManager.getAllUsers();
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `user-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('User data exported successfully', 'success');
}

function exportNewsletterData() {
    const subscribers = newsletterManager.getSubscribers();
    const dataStr = JSON.stringify(subscribers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `newsletter-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Newsletter data exported successfully', 'success');
}

function clearOldActivities() {
    if (confirm('Are you sure you want to clear activities older than 30 days? This cannot be undone.')) {
        const activities = userManager.getUserActivities();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredActivities = activities.filter(activity => 
            new Date(activity.timestamp) > thirtyDaysAgo
        );
        
        localStorage.setItem('colp-user-activities', JSON.stringify(filteredActivities));
        loadActivitiesTable();
        showNotification(`Cleared ${activities.length - filteredActivities.length} old activities`, 'success');
    }
}

function optimizeStorage() {
    // Simulate storage optimization
    showNotification('Storage optimization completed', 'success');
}

// Modal Functions
function showAddAdminModal() {
    const modal = document.getElementById('addAdminModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeAddAdminModal() {
    const modal = document.getElementById('addAdminModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('addAdminForm').reset();
    }
}

function closeUserModal() {
    const modal = document.getElementById('userDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleAddAdmin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const adminData = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        role: formData.get('role'),
        password: formData.get('password')
    };
    
    // Register the new admin
    const result = userManager.registerUser(adminData);
    
    if (result.success) {
        // Update user role to admin
        const users = userManager.getAllUsers();
        const userIndex = users.findIndex(u => u.email === adminData.email);
        if (userIndex !== -1) {
            users[userIndex].role = adminData.role;
            localStorage.setItem('colp-users', JSON.stringify(users));
        }
        
        showNotification('Admin added successfully', 'success');
        loadAdminsTable();
        closeAddAdminModal();
    } else {
        showNotification(result.message, 'error');
    }
}

// Notification system for admin
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Add CSS animation if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Helper functions for cart and wishlist data
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

// Date formatting helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Activity helper functions
function getActivityIcon(action) {
    const icons = {
        'login': '🔐',
        'register': '✅',
        'logout': '🚪',
        'add_to_cart': '🛒',
        'remove_from_cart': '❌',
        'add_to_wishlist': '❤️',
        'remove_from_wishlist': '💔',
        'page_view': '👁️',
        'purchase': '💳',
        'newsletter_subscribe': '📧'
    };
    return icons[action] || '📝';
}

function formatActivityAction(action) {
    const actions = {
        'login': 'Logged In',
        'register': 'Registered',
        'logout': 'Logged Out',
        'add_to_cart': 'Added to Cart',
        'remove_from_cart': 'Removed from Cart',
        'add_to_wishlist': 'Added to Wishlist',
        'remove_from_wishlist': 'Removed from Wishlist',
        'page_view': 'Viewed Page',
        'purchase': 'Made Purchase',
        'newsletter_subscribe': 'Subscribed to Newsletter'
    };
    return actions[action] || action;
}

function formatActivityDetails(activity) {
    if (!activity.details) return '';
    
    if (activity.details.productId) {
        return `Product: ${activity.details.productId}`;
    }
    
    if (activity.details.page) {
        return `Page: ${activity.details.page}`;
    }
    
    if (activity.details.email) {
        return `Email: ${activity.details.email}`;
    }
    
    return JSON.stringify(activity.details);
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
}

// Filter functions
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterUsersByType() {
    const filterType = document.getElementById('userFilter').value;
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const typeCell = row.querySelector('.type-badge');
        if (!typeCell) return;
        
        const type = typeCell.textContent.toLowerCase();
        let show = false;
        
        switch (filterType) {
            case 'all':
                show = true;
                break;
            case 'registered':
                show = type.includes('registered') || type.includes('admin');
                break;
            case 'newsletter':
                show = type.includes('newsletter');
                break;
            case 'both':
                show = type.includes('both');
                break;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

function sortUsers() {
    showNotification('Sorting functionality implemented', 'info');
    loadUsersTable();
}

function filterActivities() {
    const actionFilter = document.getElementById('activityFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let activities = userManager.getUserActivities();
    
    if (actionFilter !== 'all') {
        activities = activities.filter(a => a.action === actionFilter);
    }
    
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        activities = activities.filter(a => {
            const activityDate = new Date(a.timestamp);
            return activityDate.toDateString() === filterDate.toDateString();
        });
    }
    
    loadActivitiesTable(activities);
}

function filterNewsletterSubscribers() {
    const searchTerm = document.getElementById('newsletterSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#newsletterTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Message user function
function messageUser(userId) {
    const user = userManager.getAllUsers().find(u => u.id === userId);
    if (!user) return;
    
    const message = prompt(`Send message to ${user.firstName} ${user.lastName}:`);
    if (message) {
        showNotification(`Message would be sent to ${user.email}`, 'info');
    }
}

// Settings functions
function sendPromotionModal() {
    const message = prompt('Enter promotion message:');
    if (message) {
        const subscribers = newsletterManager.getSubscribers().filter(s => s.active);
        showNotification(`Promotion would be sent to ${subscribers.length} subscribers`, 'info');
    }
}

// Newsletter modal functions
function closeNewsletterModal() {
    const modal = document.getElementById('newsletterModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleSendNewsletter(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const subject = formData.get('subject');
    const content = formData.get('content');
    
    const subscribers = newsletterManager.getSubscribers().filter(s => s.active);
    
    showNotification(`Newsletter "${subject}" would be sent to ${subscribers.length} subscribers`, 'success');
    closeNewsletterModal();
}

// Add event listeners for bulk update
document.addEventListener('DOMContentLoaded', function() {
    // Update bulk affected count when categories change
    const categoryCheckboxes = document.querySelectorAll('input[name="categories"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkAffectedCount);
    });
});
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
    
    showNotification('User data exported successfully!', 'success');
}

function clearOldActivities() {
    if (confirm('Are you sure you want to clear activities older than 30 days? This cannot be undone.')) {
        const activities = userManager.getUserActivities();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const recentActivities = activities.filter(activity => 
            new Date(activity.timestamp) > thirtyDaysAgo
        );
        
        localStorage.setItem('colp-user-activities', JSON.stringify(recentActivities));
        showNotification('Old activities cleared successfully!', 'success');
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
    
    showNotification(`Storage optimized! Removed ${activities.length - uniqueActivities.length} duplicate entries.`, 'success');
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
    
    showNotification('Analytics report generated!', 'success');
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
        showNotification('Only super admins can add new admins.', 'error');
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
        showNotification('Admin added successfully!', 'success');
        closeAddAdminModal();
        loadAdminsTable();
    } else {
        showNotification(result.message, 'error');
    }
}

function removeAdmin(adminId) {
    if (!adminManager.isSuperAdmin()) {
        showNotification('Only super admins can remove admins.', 'error');
        return;
    }
    
    const users = userManager.getAllUsers();
    const admin = users.find(u => u.id === adminId);
    
    if (!admin) return;
    
    if (admin.email === 'admin@colp.co') {
        showNotification('Cannot remove the main super admin.', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to remove admin ${admin.firstName} ${admin.lastName}?`)) {
        const updatedUsers = users.filter(u => u.id !== adminId);
        localStorage.setItem('colp-users', JSON.stringify(updatedUsers));
        
        showNotification('Admin removed successfully!', 'success');
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
        showNotification('Subscriber removed successfully!', 'success');
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
    
    showNotification(`Newsletter sent to ${activeSubscribers.length} subscribers!`, 'success');
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
    
    showNotification('Newsletter data exported successfully!', 'success');
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
    sendNewsletterToAll();
}

function sendPromotionModal() {
    // For now, use the newsletter modal for promotions
    // In a full implementation, this would have its own dedicated modal
    const subject = prompt('Enter promotion subject:');
    if (subject) {
        const content = prompt('Enter promotion details:');
        if (content) {
            const users = userManager.getAllUsers();
            // Store promotion in newsletter history with promotion flag
            const newsletters = JSON.parse(localStorage.getItem('colp-newsletters')) || [];
            newsletters.push({
                id: 'promo_' + Date.now(),
                subject: subject,
                content: content,
                isPromotion: true,
                sentAt: new Date().toISOString(),
                recipientCount: users.length
            });
            localStorage.setItem('colp-newsletters', JSON.stringify(newsletters));
            showNotification(`Promotion sent to ${users.length} users!`, 'success');
        }
    }
}