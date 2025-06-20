// Orders Page JavaScript

// Mock order data (in real app, this would come from backend)
function generateMockOrders() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return [];

    // Check if user already has orders
    const existingOrders = JSON.parse(localStorage.getItem(`colp-orders-${currentUser.id}`)) || [];
    
    // If no orders exist, create some sample orders for demo
    if (existingOrders.length === 0) {
        const sampleOrders = [
            {
                id: 'ORDER_001',
                userId: currentUser.id,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'delivered',
                items: [
                    { name: "Dragon's Ember Ring", quantity: 1, price: 89.99, image: 'images/dragon-ring.jpg' },
                    { name: "Elven Moonstone Pendant", quantity: 1, price: 124.99, image: 'images/moonstone-pendant.jpg' }
                ],
                total: 229.98,
                shippingAddress: '123 Magic Lane, Fantasy City, FC 12345',
                trackingNumber: 'TRK123456789'
            },
            {
                id: 'ORDER_002', 
                userId: currentUser.id,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'processing',
                items: [
                    { name: "Mystical Crystal Brooch", quantity: 1, price: 156.99, image: 'images/crystal-brooch.jpg' }
                ],
                total: 171.99, // including shipping
                shippingAddress: '123 Magic Lane, Fantasy City, FC 12345',
                trackingNumber: null
            },
            {
                id: 'ORDER_003',
                userId: currentUser.id,
                date: new Date().toISOString(),
                status: 'pending',
                items: [
                    { name: "Guardian's Seal Ring", quantity: 1, price: 178.99, image: 'images/guardian-ring.jpg' },
                    { name: "Forest Spirit Necklace", quantity: 1, price: 142.99, image: 'images/forest-necklace.jpg' }
                ],
                total: 321.98,
                shippingAddress: '123 Magic Lane, Fantasy City, FC 12345',
                trackingNumber: null
            }
        ];
        
        localStorage.setItem(`colp-orders-${currentUser.id}`, JSON.stringify(sampleOrders));
        return sampleOrders;
    }
    
    return existingOrders;
}

// Load user orders
function loadUserOrders() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const orders = generateMockOrders();
    const container = document.getElementById('ordersContainer');
    const noOrdersDiv = document.getElementById('noOrders');
    
    if (orders.length === 0) {
        container.style.display = 'none';
        noOrdersDiv.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noOrdersDiv.style.display = 'none';
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = orders.map(order => `
        <div class="order-item" data-status="${order.status}">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${formatOrderDate(order.date)}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${formatStatus(order.status)}</span>
                    <span class="order-total">$${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p>Quantity: ${item.quantity} × $${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-actions">
                <button class="btn-secondary" onclick="viewOrderDetails('${order.id}')">View Details</button>
                ${order.status === 'delivered' ? '<button class="btn-primary" onclick="reorderItems(\'' + order.id + '\')">Reorder</button>' : ''}
                ${order.trackingNumber ? '<button class="btn-secondary" onclick="trackOrder(\'' + order.trackingNumber + '\')">Track Order</button>' : ''}
                ${order.status === 'pending' ? '<button class="btn-danger" onclick="cancelOrder(\'' + order.id + '\')">Cancel</button>' : ''}
            </div>
        </div>
    `).join('');
    
    // Update statistics
    updateOrderStats(orders);
}

// Update order statistics
function updateOrderStats(orders) {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => ['pending', 'processing'].includes(order.status)).length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    document.getElementById('totalOrdersCount').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('avgOrderValue').textContent = `$${avgOrderValue.toFixed(2)}`;
}

// Load frequently bought items
function loadFrequentItems() {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const orders = JSON.parse(localStorage.getItem(`colp-orders-${currentUser.id}`)) || [];
    const itemCounts = {};
    
    // Count item frequencies
    orders.forEach(order => {
        order.items.forEach(item => {
            if (itemCounts[item.name]) {
                itemCounts[item.name].count += item.quantity;
            } else {
                itemCounts[item.name] = {
                    count: item.quantity,
                    item: item
                };
            }
        });
    });
    
    // Sort by frequency and take top 4
    const frequentItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    
    const container = document.getElementById('frequentItems');
    
    if (frequentItems.length === 0) {
        container.innerHTML = '<p class="no-data">No frequent items yet. Place more orders to see your favorites!</p>';
        return;
    }
    
    container.innerHTML = frequentItems.map(({ item, count }) => `
        <div class="frequent-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="frequent-item-info">
                <h4>${item.name}</h4>
                <p>Ordered ${count} time${count > 1 ? 's' : ''}</p>
                <span class="price">$${item.price.toFixed(2)}</span>
            </div>
            <button class="btn-primary btn-small" onclick="addFrequentItemToCart('${item.name}', ${item.price})">Add to Cart</button>
        </div>
    `).join('');
}

// Filter orders
function filterOrders() {
    const filter = document.getElementById('orderFilter').value;
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        const status = item.dataset.status;
        if (filter === 'all' || status === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// View order details
function viewOrderDetails(orderId) {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const orders = JSON.parse(localStorage.getItem(`colp-orders-${currentUser.id}`)) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    
    content.innerHTML = `
        <div class="order-detail-section">
            <h3>📦 Order Information</h3>
            <div class="order-detail-grid">
                <div class="detail-item">
                    <label>Order ID:</label>
                    <span>${order.id}</span>
                </div>
                <div class="detail-item">
                    <label>Order Date:</label>
                    <span>${formatOrderDate(order.date)}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge ${order.status}">${formatStatus(order.status)}</span>
                </div>
                <div class="detail-item">
                    <label>Total Amount:</label>
                    <span class="total-amount">$${order.total.toFixed(2)}</span>
                </div>
                ${order.trackingNumber ? `
                <div class="detail-item">
                    <label>Tracking Number:</label>
                    <span>${order.trackingNumber}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="order-detail-section">
            <h3>🛍️ Items Ordered</h3>
            <div class="order-items-detail">
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Unit Price: $${item.price.toFixed(2)}</p>
                        </div>
                        <div class="item-total">
                            $${(item.quantity * item.price).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="order-detail-section">
            <h3>🚚 Shipping Information</h3>
            <div class="shipping-info">
                <p><strong>Shipping Address:</strong></p>
                <p>${order.shippingAddress}</p>
                ${order.trackingNumber ? `
                <div class="tracking-info">
                    <button class="btn-primary" onclick="trackOrder('${order.trackingNumber}')">Track Package</button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

// Reorder items
function reorderItems(orderId) {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;

    const orders = JSON.parse(localStorage.getItem(`colp-orders-${currentUser.id}`)) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Add all items from the order to cart
    let addedCount = 0;
    order.items.forEach(item => {
        // Simulate adding to cart (you'll need to implement this based on your product system)
        addedCount++;
    });
    
    showCartNotification(`${addedCount} items added to cart!`, 'success');
    userManager.trackUserActivity('reorder', { orderId: orderId });
}

// Track order
function trackOrder(trackingNumber) {
    // Simulate tracking (in real app, this would open tracking page or modal)
    const trackingInfo = {
        'TRK123456789': {
            status: 'Delivered',
            location: 'Fantasy City, FC',
            lastUpdate: 'Package delivered to recipient',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
    };
    
    const info = trackingInfo[trackingNumber] || {
        status: 'In Transit',
        location: 'Processing Center',
        lastUpdate: 'Package is being processed',
        date: new Date().toISOString()
    };
    
    alert(`Tracking #${trackingNumber}\nStatus: ${info.status}\nLocation: ${info.location}\nLast Update: ${info.lastUpdate}\n\nIn a real app, this would open a detailed tracking page.`);
}

// Cancel order
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) return;

        const orders = JSON.parse(localStorage.getItem(`colp-orders-${currentUser.id}`)) || [];
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'cancelled';
            localStorage.setItem(`colp-orders-${currentUser.id}`, JSON.stringify(orders));
            
            showCartNotification('Order cancelled successfully!', 'success');
            loadUserOrders();
            userManager.trackUserActivity('order_cancelled', { orderId: orderId });
        }
    }
}

// Add frequent item to cart
function addFrequentItemToCart(itemName, price) {
    // This is a simplified version - in real app you'd need proper product IDs
    showCartNotification(`${itemName} added to cart!`, 'success');
    userManager.trackUserActivity('add_to_cart', { productName: itemName, source: 'frequent_items' });
}

// Helper functions
function formatOrderDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuthAccess()) {
        return;
    }
    
    // Load orders and data
    loadUserOrders();
    loadFrequentItems();
    
    // Initialize cart and wishlist
    updateCartCount();
    wishlistManager.updateWishlistCount();
    
    // Initialize user navigation
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        userManager.updateUIForLoggedInUser(currentUser);
    }
    
    // Track page view
    userManager.trackUserActivity('page_view', { page: 'orders' });
});