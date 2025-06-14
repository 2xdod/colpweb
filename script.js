// Product filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    // Product page filters
    if (document.getElementById('productsGrid')) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                const category = this.dataset.category;
                const style = this.dataset.style;

                productCards.forEach(card => {
                    const cardCategory = card.dataset.category;
                    const cardStyle = card.dataset.style;

                    if (category === 'all' || cardCategory === category || cardStyle === style) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease-in';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Custom order form functionality
    const customOrderForm = document.getElementById('customOrderForm');
    if (customOrderForm) {
        customOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hide the form and show thank you page
            document.querySelector('.customized-page').style.display = 'none';
            document.getElementById('thank-you-page').style.display = 'flex';
        });
    }

    // Story library alphabet navigation
    const letterButtons = document.querySelectorAll('.letter-btn');
    const letterSections = document.querySelectorAll('.letter-section');

    letterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            letterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const letter = this.dataset.letter;

            // Hide all sections
            letterSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });

            // Show selected section
            const targetSection = document.querySelector(`.letter-section[data-letter="${letter}"]`);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.style.display = 'block';
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Initialize the first section as visible
    if (document.querySelector('.library-page')) {
        letterSections.forEach(section => {
            if (!section.classList.contains('active')) {
                section.style.display = 'none';
            }
        });
    }

    // Stories page functionality
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        const readMoreBtn = card.querySelector('.read-more');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', function() {
                // Simulate reading a story
                alert('This would open the full story. In a real implementation, this would navigate to a detailed story page.');
                
                // Update click count for popular stories
                const clicksElement = card.querySelector('.story-clicks');
                if (clicksElement) {
                    const currentClicks = parseInt(card.dataset.clicks) || 0;
                    const newClicks = currentClicks + 1;
                    card.dataset.clicks = newClicks;
                    clicksElement.textContent = `${newClicks.toLocaleString()} reads`;
                }
            });
        }
    });

    // Smooth scrolling for contact buttons
    const contactButtons = document.querySelectorAll('button[onclick*="contact-section"]');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('contact-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Simulate adding to cart
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            
            // Create a temporary notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #DAA520, #FFD700);
                color: #1a1a2e;
                padding: 1rem 2rem;
                border-radius: 10px;
                font-weight: bold;
                z-index: 10000;
                animation: slideIn 0.5s ease-out;
            `;
            notification.textContent = `${productName} added to cart!`;
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.5s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 3000);
        });
    });

    // File upload preview for custom orders
    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Create preview image if it doesn't exist
                    let preview = document.getElementById('image-preview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.id = 'image-preview';
                        preview.style.cssText = `
                            max-width: 200px;
                            max-height: 200px;
                            border-radius: 10px;
                            border: 2px solid #DAA520;
                            margin-top: 1rem;
                            display: block;
                        `;
                        imageUpload.parentNode.appendChild(preview);
                    }
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Sort stories by popularity on stories page
    const sortStoriesByPopularity = () => {
        const popularSection = document.querySelector('.stories-section');
        if (popularSection) {
            const storyCards = Array.from(popularSection.querySelectorAll('.story-card[data-clicks]'));
            storyCards.sort((a, b) => {
                const clicksA = parseInt(a.dataset.clicks) || 0;
                const clicksB = parseInt(b.dataset.clicks) || 0;
                return clicksB - clicksA;
            });
            
            const grid = popularSection.querySelector('.stories-grid');
            if (grid) {
                storyCards.forEach(card => grid.appendChild(card));
            }
        }
    };

    // Call sorting function if on stories page
    if (document.querySelector('.stories-page')) {
        sortStoriesByPopularity();
    }
});

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.product-card, .story-card, .example-category');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});

// Mobile Menu Toggle Function
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && mobileToggle) {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    }
}

// Close mobile menu when clicking on menu items
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            
            if (navMenu && mobileToggle) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const navMenu = document.getElementById('navMenu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navbar = document.querySelector('.navbar');
        
        if (navMenu && mobileToggle && !navbar.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });
});

// Search functionality for story library
const createSearchBox = () => {
    const libraryHeader = document.querySelector('.library-header');
    if (libraryHeader && !document.getElementById('story-search')) {
        const searchBox = document.createElement('input');
        searchBox.id = 'story-search';
        searchBox.type = 'text';
        searchBox.placeholder = 'Search stories...';
        searchBox.style.cssText = `
            margin: 1rem auto;
            display: block;
            padding: 1rem;
            border: 1px solid #DAA520;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            max-width: 400px;
            width: 100%;
        `;
        
        libraryHeader.appendChild(searchBox);
        
        searchBox.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const storyItems = document.querySelectorAll('.story-list-item');
            
            storyItems.forEach(item => {
                const title = item.querySelector('h3').textContent.toLowerCase();
                const description = item.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
};

// Add search box to library page
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.library-page')) {
        createSearchBox();
    }
});

// Make COLP logo clickable
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo h1');
    if (logo) {
        logo.addEventListener('click', function() {
            location.href = 'index.html';
        });
    }
});

// Testimonials carousel
let currentTestimonial = 1;
const totalTestimonials = 5;

function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
    });
    
    const activeTestimonial = document.querySelector(`[data-testimonial="${index}"]`);
    if (activeTestimonial) {
        activeTestimonial.classList.add('active');
    }
}

function nextTestimonial() {
    currentTestimonial = currentTestimonial >= totalTestimonials ? 1 : currentTestimonial + 1;
    showTestimonial(currentTestimonial);
}

// Auto-rotate testimonials every 3 seconds
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.testimonials-carousel')) {
        setInterval(nextTestimonial, 3000);
    }
});

// Custom order functions
function openCustomOrder(category = '') {
    let url = 'contact-us.html';
    if (category) {
        url += '?category=' + encodeURIComponent(category);
    }
    window.location.href = url;
}

// Handle custom order form with pre-selected category
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('customOrderForm')) {
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedCategory = urlParams.get('category');
        
        if (preselectedCategory) {
            const categorySelect = document.getElementById('category');
            if (categorySelect) {
                categorySelect.value = preselectedCategory;
                categorySelect.dispatchEvent(new Event('change'));
            }
        }
        
        // Handle file uploads
        const fileUpload = document.getElementById('imageUpload');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const imagePreview = document.getElementById('imagePreview');
        
        if (fileUpload && fileUploadArea) {
            // Drag and drop functionality
            fileUploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = '#ffd700';
                this.style.background = 'rgba(255, 215, 0, 0.1)';
            });
            
            fileUploadArea.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                this.style.background = 'transparent';
            });
            
            fileUploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                this.style.background = 'transparent';
                
                const files = e.dataTransfer.files;
                handleFileUpload(files);
            });
            
            fileUpload.addEventListener('change', function() {
                handleFileUpload(this.files);
            });
        }
        
        function handleFileUpload(files) {
            // Limit to 4 images
            const maxFiles = 4;
            const filesToProcess = Array.from(files).slice(0, maxFiles);
            
            if (files.length > maxFiles) {
                alert(`You can upload a maximum of ${maxFiles} images. Only the first ${maxFiles} images will be processed.`);
            }
            
            imagePreview.innerHTML = '';
            
            filesToProcess.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageContainer = document.createElement('div');
                        imageContainer.style.cssText = `
                            position: relative;
                            display: inline-block;
                        `;
                        
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.cssText = `
                            width: 120px;
                            height: 120px;
                            object-fit: cover;
                            border-radius: 10px;
                            border: 2px solid rgba(255, 215, 0, 0.3);
                        `;
                        
                        const label = document.createElement('div');
                        label.textContent = `Image ${index + 1}`;
                        label.style.cssText = `
                            position: absolute;
                            top: -10px;
                            left: 5px;
                            background: rgba(255, 215, 0, 0.9);
                            color: #1a1330;
                            padding: 2px 6px;
                            border-radius: 3px;
                            font-size: 0.7rem;
                            font-weight: bold;
                        `;
                        
                        imageContainer.appendChild(img);
                        imageContainer.appendChild(label);
                        imagePreview.appendChild(imageContainer);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Update file input to only include the first 4 files
            const dt = new DataTransfer();
            filesToProcess.forEach(file => {
                dt.items.add(file);
            });
            fileUpload.files = dt.files;
        }
        
        // Form submission
        document.getElementById('customOrderForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message
            const formData = new FormData(this);
            const orderData = {
                category: formData.get('category'),
                description: formData.get('description'),
                name: formData.get('fullName'),
                email: formData.get('email')
            };
            
            // Simulate order submission
            alert(`Thank you ${orderData.name}! Your custom ${orderData.category} jewelry order has been submitted. We'll contact you at ${orderData.email} within 24-48 hours with an estimated visual mockup and detailed pricing information.`);
            
            // Show thank you page
            document.querySelector('.contact-page').style.display = 'none';
            document.getElementById('thank-you-page').style.display = 'flex';
        });
    }
});

// Story page functions
function openStory(storyId) {
    location.href = `story-${storyId}.html`;
}

// Sorting functionality for story pages
function sortStories(sortBy) {
    const grid = document.getElementById('storiesGrid');
    if (!grid) return;
    
    const stories = Array.from(grid.children);
    
    stories.sort((a, b) => {
        switch (sortBy) {
            case 'popularity':
                const clicksA = parseInt(a.dataset.clicks) || 0;
                const clicksB = parseInt(b.dataset.clicks) || 0;
                return clicksB - clicksA;
                
            case 'date-desc':
                const dateA = new Date(a.dataset.date);
                const dateB = new Date(b.dataset.date);
                return dateB - dateA;
                
            case 'date-asc':
                const dateA2 = new Date(a.dataset.date);
                const dateB2 = new Date(b.dataset.date);
                return dateA2 - dateB2;
                
            case 'alphabetical':
                const titleA = a.querySelector('h3').textContent;
                const titleB = b.querySelector('h3').textContent;
                return titleA.localeCompare(titleB);
                
            default:
                return 0;
        }
    });
    
    // Clear and re-append sorted stories
    grid.innerHTML = '';
    stories.forEach(story => {
        story.style.animation = 'fadeIn 0.5s ease-in';
        grid.appendChild(story);
    });
}

// Make product cards clickable
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productId = card.getAttribute('data-product-id');
        if (!productId) return;
        
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking the "Add to Cart" button
            if (e.target.classList.contains('add-to-cart')) return;
            
            // Navigate to product detail page
            openProductPage(productId);
        });
    });
});

// Enhanced mobile responsiveness
window.addEventListener('resize', function() {
    const testimonialCarousel = document.querySelector('.testimonials-carousel');
    if (testimonialCarousel && window.innerWidth <= 768) {
        // Adjust testimonial display for mobile
        const testimonials = document.querySelectorAll('.testimonial-content p');
        testimonials.forEach(p => {
            if (window.innerWidth <= 480) {
                p.style.fontSize = '1.1rem';
            } else {
                p.style.fontSize = '1.3rem';
            }
        });
    }
});

// Shopping Cart Functionality
let cart = JSON.parse(localStorage.getItem('colp-cart')) || [];

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('hidden', totalItems === 0);
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartActions = document.getElementById('cartActions');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.style.display = 'none';
        cartActions.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" onclick="openProductPage('${item.id}')" style="cursor: pointer;">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <small style="color: #8B4513; font-style: italic;">Click to view product</small>
                </div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="cart-item-remove" onclick="event.stopPropagation(); removeFromCart('${item.id}')">Remove</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalAmount.textContent = total.toFixed(2);
        cartTotal.style.display = 'block';
        cartActions.style.display = 'flex';
    }
}

// Inventory Management System
const inventoryManager = {
    // Initialize inventory from product data
    initialize() {
        const productCards = document.querySelectorAll('.product-card[data-stock]');
        productCards.forEach(card => {
            const productId = card.dataset.productId;
            const stock = parseInt(card.dataset.stock);
            
            // Store initial stock in localStorage if not exists
            const storedStock = localStorage.getItem(`stock-${productId}`);
            if (storedStock === null) {
                localStorage.setItem(`stock-${productId}`, stock.toString());
            }
        });
        this.updateAllStockDisplays();
    },

    // Get current stock for a product
    getStock(productId) {
        const stock = localStorage.getItem(`stock-${productId}`);
        return stock ? parseInt(stock) : 0;
    },

    // Update stock for a product
    updateStock(productId, newStock) {
        localStorage.setItem(`stock-${productId}`, Math.max(0, newStock).toString());
        this.updateStockDisplay(productId);
    },

    // Reduce stock when item is added to cart
    reduceStock(productId, quantity = 1) {
        const currentStock = this.getStock(productId);
        const newStock = Math.max(0, currentStock - quantity);
        this.updateStock(productId, newStock);
        return newStock;
    },

    // Increase stock when item is removed from cart
    increaseStock(productId, quantity = 1) {
        const currentStock = this.getStock(productId);
        const newStock = currentStock + quantity;
        this.updateStock(productId, newStock);
        return newStock;
    },

    // Update stock display for a specific product
    updateStockDisplay(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (!productCard) return;

        const currentStock = this.getStock(productId);
        const stockBadge = productCard.querySelector('.product-stock-badge');
        const addToCartBtn = productCard.querySelector('.add-to-cart');

        if (currentStock === 0) {
            stockBadge.textContent = 'Out of Stock';
            stockBadge.className = 'product-stock-badge stock-out';
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.className = 'add-to-cart out-of-stock';
            addToCartBtn.disabled = true;
            productCard.dataset.stock = '0';
        } else if (currentStock <= 5) {
            stockBadge.textContent = `Only ${currentStock} left!`;
            stockBadge.className = 'product-stock-badge stock-low';
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.className = 'add-to-cart';
            addToCartBtn.disabled = false;
            productCard.dataset.stock = currentStock.toString();
        } else {
            stockBadge.textContent = `${currentStock} in stock`;
            stockBadge.className = 'product-stock-badge';
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.className = 'add-to-cart';
            addToCartBtn.disabled = false;
            productCard.dataset.stock = currentStock.toString();
        }
    },

    // Update all stock displays
    updateAllStockDisplays() {
        const productCards = document.querySelectorAll('.product-card[data-product-id]');
        productCards.forEach(card => {
            const productId = card.dataset.productId;
            this.updateStockDisplay(productId);
        });
    },

    // Check if product is in stock
    isInStock(productId, quantity = 1) {
        return this.getStock(productId) >= quantity;
    }
};

function addToCart(productId) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productCard) return;

    // Check stock availability
    if (!inventoryManager.isInStock(productId, 1)) {
        showCartNotification(`Sorry, ${productCard.dataset.productName} is out of stock!`, 'error');
        return;
    }
    
    const product = {
        id: productId,
        name: productCard.dataset.productName,
        price: parseFloat(productCard.dataset.productPrice),
        image: productCard.dataset.productImage
    };
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    // Reduce stock
    inventoryManager.reduceStock(productId, 1);
    
    localStorage.setItem('colp-cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    
    // Show notification
    showCartNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    const removedItem = cart.find(item => item.id === productId);
    if (removedItem) {
        // Restore stock
        inventoryManager.increaseStock(productId, removedItem.quantity);
    }
    
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('colp-cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
}

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        const isVisible = cartModal.style.display === 'flex';
        cartModal.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            updateCartDisplay();
        }
    }
}

function checkout() {
    if (cart.length === 0) {
        showCartNotification('Your cart is empty! Add some products first.', 'info');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);
        return;
    }
    
    // Redirect to checkout page instead of showing alert
    window.location.href = 'checkout.html';
}

function goToCheckout() {
    if (cart.length === 0) {
        showCartNotification('Your cart is empty! Add some products first.', 'info');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

function showCartNotification(message, type = 'success') {
    const notification = document.createElement('div');
    
    let bgColor, textColor;
    if (type === 'error') {
        bgColor = 'linear-gradient(45deg, #dc3545, #e74c3c)';
        textColor = 'white';
    } else if (type === 'info') {
        bgColor = 'linear-gradient(45deg, #17a2b8, #20c997)';
        textColor = 'white';
    } else {
        bgColor = 'linear-gradient(45deg, #8B4513, #d4af37)';
        textColor = '#faf8f3';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        background: ${bgColor};
        color: ${textColor};
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10001;
        animation: slideIn 0.5s ease-out;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

function openProductPage(productId) {
    // Close cart modal if it's open
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.style.display === 'flex') {
        toggleCart();
    }
    
    // Navigate to product detail page
    window.location.href = `product-${productId}.html`;
}

// Product Detail Page Functions
function changeMainImage(src, thumbnail) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        // Update main image with higher resolution version
        const highResSrc = src.replace('120x120', '500x500');
        mainImage.src = highResSrc;
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        thumbnail.classList.add('active');
    }
}

function increaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
        }
    }
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    }
}

function addToCartFromDetail(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // Find product data from the page
    const productTitle = document.querySelector('.product-title');
    const productPrice = document.querySelector('.product-price');
    const mainImage = document.getElementById('mainImage');
    
    if (!productTitle || !productPrice || !mainImage) return;
    
    const product = {
        id: productId,
        name: productTitle.textContent,
        price: parseFloat(productPrice.textContent.replace('$', '')),
        image: mainImage.src
    };
    
    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
    }
    
    localStorage.setItem('colp-cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    
    // Show notification with quantity
    const message = quantity === 1 
        ? `${product.name} added to cart!`
        : `${quantity}x ${product.name} added to cart!`;
    showCartNotification(message);
    
    // Reset quantity to 1
    if (quantityInput) {
        quantityInput.value = 1;
    }
}

// Checkout Page Functions
function populateCheckoutSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const cartItemsHidden = document.getElementById('cartItemsHidden');
    const totalAmountHidden = document.getElementById('totalAmountHidden');
    
    if (!summaryItems || cart.length === 0) return;
    
    // Clear existing items
    summaryItems.innerHTML = '';
    
    let subtotal = 0;
    
    // Add each cart item to summary
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">$${itemTotal.toFixed(2)}</div>
        `;
        summaryItems.appendChild(summaryItem);
    });
    
    // Update totals
    const shipping = subtotal >= 100 ? 0 : 15; // Free shipping over $100
    const total = subtotal + shipping;
    
    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;
    
    // Update shipping display
    const summaryShipping = document.getElementById('summaryShipping');
    if (summaryShipping) {
        summaryShipping.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    }
    
    // Populate hidden form fields
    if (cartItemsHidden) {
        const cartData = cart.map(item => `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join(', ');
        cartItemsHidden.value = cartData;
    }
    
    if (totalAmountHidden) {
        totalAmountHidden.value = total.toFixed(2);
    }
}

// Wishlist Management System
const wishlistManager = {
    // Get wishlist from localStorage
    getWishlist() {
        return JSON.parse(localStorage.getItem('colp-wishlist')) || [];
    },

    // Save wishlist to localStorage
    saveWishlist(wishlist) {
        localStorage.setItem('colp-wishlist', JSON.stringify(wishlist));
        this.updateWishlistCount();
        this.updateWishlistButtons();
    },

    // Add item to wishlist
    addToWishlist(productId) {
        const wishlist = this.getWishlist();
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            this.saveWishlist(wishlist);
            return true;
        }
        return false;
    },

    // Remove item from wishlist
    removeFromWishlist(productId) {
        const wishlist = this.getWishlist();
        const newWishlist = wishlist.filter(id => id !== productId);
        this.saveWishlist(newWishlist);
        return true;
    },

    // Check if item is in wishlist
    isInWishlist(productId) {
        return this.getWishlist().includes(productId);
    },

    // Update wishlist count in navigation
    updateWishlistCount() {
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            const count = this.getWishlist().length;
            wishlistCount.textContent = count;
            wishlistCount.classList.toggle('hidden', count === 0);
        }
    },

    // Update all wishlist buttons
    updateWishlistButtons() {
        const wishlist = this.getWishlist();
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        
        wishlistButtons.forEach(button => {
            const productCard = button.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                const heartIcon = button.querySelector('.heart-icon');
                
                if (wishlist.includes(productId)) {
                    button.classList.add('active');
                    heartIcon.textContent = '❤️';
                } else {
                    button.classList.remove('active');
                    heartIcon.textContent = '🤍';
                }
            }
        });
    },

    // Get wishlist products data
    getWishlistProducts() {
        const wishlist = this.getWishlist();
        const products = [];
        
        wishlist.forEach(productId => {
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                products.push({
                    id: productId,
                    name: productCard.dataset.productName,
                    price: parseFloat(productCard.dataset.productPrice),
                    image: productCard.dataset.productImage,
                    stock: inventoryManager.getStock(productId)
                });
            }
        });
        
        return products;
    }
};

// Toggle wishlist item
function toggleWishlist(productId) {
    const isInWishlist = wishlistManager.isInWishlist(productId);
    
    if (isInWishlist) {
        wishlistManager.removeFromWishlist(productId);
        showCartNotification('Removed from wishlist', 'info');
    } else {
        wishlistManager.addToWishlist(productId);
        showCartNotification('Added to wishlist!', 'success');
    }
}

// Toggle wishlist modal
function toggleWishlistModal() {
    let wishlistModal = document.getElementById('wishlistModal');
    
    if (!wishlistModal) {
        createWishlistModal();
        wishlistModal = document.getElementById('wishlistModal');
    }
    
    const isVisible = wishlistModal.style.display === 'flex';
    wishlistModal.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible) {
        updateWishlistDisplay();
    }
}

// Create wishlist modal
function createWishlistModal() {
    const modalHTML = `
        <div class="cart-modal" id="wishlistModal">
            <div class="cart-content">
                <div class="cart-header">
                    <h2>My Wishlist</h2>
                    <button class="cart-close" onclick="toggleWishlistModal()">&times;</button>
                </div>
                <div class="cart-items" id="wishlistItems">
                    <div class="cart-empty">
                        <div class="cart-empty-icon">❤️</div>
                        <p>Your wishlist is empty</p>
                    </div>
                </div>
                <div class="cart-actions" id="wishlistActions" style="display: none;">
                    <button class="cart-checkout" onclick="addAllToCart()">Add All to Cart</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Update wishlist display
function updateWishlistDisplay() {
    const wishlistItems = document.getElementById('wishlistItems');
    const wishlistActions = document.getElementById('wishlistActions');
    
    if (!wishlistItems) return;
    
    const products = wishlistManager.getWishlistProducts();
    
    if (products.length === 0) {
        wishlistItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">❤️</div>
                <p>Your wishlist is empty</p>
            </div>
        `;
        wishlistActions.style.display = 'none';
    } else {
        wishlistItems.innerHTML = products.map(product => `
            <div class="cart-item" onclick="openProductPage('${product.id}')" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <p>Stock: ${product.stock > 0 ? product.stock + ' available' : 'Out of stock'}</p>
                    <small style="color: #8B4513; font-style: italic;">Click to view product</small>
                </div>
                <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="event.stopPropagation(); removeFromWishlist('${product.id}')">Remove</button>
            </div>
        `).join('');
        
        wishlistActions.style.display = 'flex';
    }
}

// Remove from wishlist
function removeFromWishlist(productId) {
    wishlistManager.removeFromWishlist(productId);
    updateWishlistDisplay();
}

// Add all wishlist items to cart
function addAllToCart() {
    const products = wishlistManager.getWishlistProducts();
    let addedCount = 0;
    
    products.forEach(product => {
        if (inventoryManager.isInStock(product.id, 1)) {
            addToCart(product.id);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        showCartNotification(`${addedCount} items added to cart!`);
        // Clear wishlist after adding to cart
        wishlistManager.saveWishlist([]);
        updateWishlistDisplay();
    } else {
        showCartNotification('No items could be added (out of stock)', 'error');
    }
}

// User Management System
const userManager = {
    // Get current user
    getCurrentUser() {
        const userData = localStorage.getItem('colp-current-user');
        return userData ? JSON.parse(userData) : null;
    },

    // Get all users
    getAllUsers() {
        const users = localStorage.getItem('colp-users');
        return users ? JSON.parse(users) : [];
    },

    // Save user to database
    saveUser(userData) {
        const users = this.getAllUsers();
        const existingUserIndex = users.findIndex(user => user.email === userData.email);
        
        if (existingUserIndex !== -1) {
            users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
        } else {
            userData.id = 'user_' + Date.now();
            userData.createdAt = new Date().toISOString();
            userData.lastLogin = new Date().toISOString();
            users.push(userData);
        }
        
        localStorage.setItem('colp-users', JSON.stringify(users));
        return userData;
    },

    // Login user
    loginUser(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.saveUser(user);
            localStorage.setItem('colp-current-user', JSON.stringify(user));
            this.updateUIForLoggedInUser(user);
            this.trackUserActivity('login');
            return { success: true, user };
        }
        
        return { success: false, message: 'Invalid email or password' };
    },

    // Register user
    registerUser(userData) {
        const users = this.getAllUsers();
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
            return { success: false, message: 'Email already registered' };
        }
        
        const newUser = this.saveUser(userData);
        localStorage.setItem('colp-current-user', JSON.stringify(newUser));
        this.updateUIForLoggedInUser(newUser);
        this.trackUserActivity('register');
        return { success: true, user: newUser };
    },

    // Logout user
    logoutUser() {
        const user = this.getCurrentUser();
        if (user) {
            this.trackUserActivity('logout');
        }
        localStorage.removeItem('colp-current-user');
        this.updateUIForLoggedOutUser();
    },

    // Update UI for logged in user
    updateUIForLoggedInUser(user) {
        // Update navigation with user info
        this.updateUserNavigation(user);
        
        // Show welcome message
        showCartNotification(`Welcome back, ${user.firstName}!`, 'success');
    },

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        this.updateUserNavigation(null);
    },

    // Update navigation with user info
    updateUserNavigation(user) {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Remove existing user menu if any
        const existingUserMenu = navMenu.querySelector('.user-menu');
        if (existingUserMenu) {
            existingUserMenu.remove();
        }

        if (user) {
            // Add user menu
            const userMenuItem = document.createElement('li');
            userMenuItem.className = 'user-menu';
            userMenuItem.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-btn" onclick="toggleUserDropdown()">
                        👤 ${user.firstName}
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="user-dropdown-content" id="userDropdown">
                        <a href="#" onclick="openUserProfile()">👤 My Profile</a>
                        <a href="#" onclick="openOrderHistory()">📦 My Orders</a>
                        <a href="#" onclick="openUserSettings()">⚙️ Settings</a>
                        ${this.isAdmin(user) ? '<hr><a href="admin.html">🔧 Admin Dashboard</a>' : ''}
                        <hr>
                        <a href="#" onclick="logoutUser()">🚪 Logout</a>
                    </div>
                </div>
            `;
            
            // Insert before wishlist icon
            const wishlistItem = navMenu.querySelector('li:nth-last-child(2)');
            navMenu.insertBefore(userMenuItem, wishlistItem);
        } else {
            // Add login/register link
            const authMenuItem = document.createElement('li');
            authMenuItem.innerHTML = `<a href="auth.html">👤 Login / Register</a>`;
            
            // Insert before wishlist icon
            const wishlistItem = navMenu.querySelector('li:nth-last-child(2)');
            navMenu.insertBefore(authMenuItem, wishlistItem);
        }
    },

    // Track user activity
    trackUserActivity(action, data = {}) {
        const user = this.getCurrentUser();
        if (!user) return;

        const activity = {
            userId: user.id,
            action: action,
            timestamp: new Date().toISOString(),
            data: data,
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        // Get existing activities
        const activities = JSON.parse(localStorage.getItem('colp-user-activities')) || [];
        activities.push(activity);

        // Keep only last 1000 activities to prevent storage overflow
        if (activities.length > 1000) {
            activities.splice(0, activities.length - 1000);
        }

        localStorage.setItem('colp-user-activities', JSON.stringify(activities));
    },

    // Get user activities
    getUserActivities(userId = null) {
        const activities = JSON.parse(localStorage.getItem('colp-user-activities')) || [];
        return userId ? activities.filter(activity => activity.userId === userId) : activities;
    },

    // Check if user is admin
    isAdmin(user = null) {
        user = user || this.getCurrentUser();
        return user && (user.role === 'admin' || user.role === 'super_admin' || user.email === 'admin@colp.co');
    }
};

// Authentication functions
function switchTab(tab) {
    // Remove active from all tabs and forms
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    // Add active to selected tab and form
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    if (!email || !password) {
        showCartNotification('Please fill in all fields', 'error');
        return;
    }
    
    const result = userManager.loginUser(email, password);
    
    if (result.success) {
        // Redirect to previous page or home
        const redirectUrl = sessionStorage.getItem('auth-redirect') || 'index.html';
        sessionStorage.removeItem('auth-redirect');
        window.location.href = redirectUrl;
    } else {
        showCartNotification(result.message, 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        birthDate: formData.get('birthDate'),
        newsletter: formData.get('newsletter') === 'on',
        role: 'customer'
    };
    
    // Validation
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        showCartNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (userData.password !== userData.confirmPassword) {
        showCartNotification('Passwords do not match', 'error');
        return;
    }
    
    if (userData.password.length < 6) {
        showCartNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Remove confirmPassword before saving
    delete userData.confirmPassword;
    
    const result = userManager.registerUser(userData);
    
    if (result.success) {
        // Add to newsletter if opted in
        if (userData.newsletter) {
            newsletterManager.addSubscriber(userData.email, 'registration');
        }
        
        showCartNotification('Account created successfully!', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            const redirectUrl = sessionStorage.getItem('auth-redirect') || 'index.html';
            sessionStorage.removeItem('auth-redirect');
            window.location.href = redirectUrl;
        }, 2000);
    } else {
        showCartNotification(result.message, 'error');
    }
}

function socialLogin(provider) {
    showCartNotification('Social login coming soon!', 'info');
}

function forgotPassword() {
    const email = prompt('Enter your email address:');
    if (email) {
        showCartNotification('Password reset link sent to your email!', 'info');
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

function openUserProfile() {
    window.location.href = 'profile.html';
    toggleUserDropdown();
}

function openOrderHistory() {
    window.location.href = 'orders.html';
    toggleUserDropdown();
}

function openUserSettings() {
    window.location.href = 'settings.html';
    toggleUserDropdown();
}

function logoutUser() {
    userManager.logoutUser();
    showCartNotification('Logged out successfully', 'info');
    toggleUserDropdown();
    
    // Redirect to home if on protected page
    if (window.location.pathname.includes('profile') || window.location.pathname.includes('orders')) {
        window.location.href = 'index.html';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('userDropdown');
    const userBtn = document.querySelector('.user-btn');
    
    if (userDropdown && userBtn && !userBtn.contains(event.target)) {
        userDropdown.style.display = 'none';
    }
});

// Newsletter Management System
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

// Enhanced cart functions to track user activity
const originalAddToCart = addToCart;
addToCart = function(productId) {
    originalAddToCart(productId);
    userManager.trackUserActivity('add_to_cart', { productId });
};

const originalRemoveFromCart = removeFromCart;
removeFromCart = function(productId) {
    originalRemoveFromCart(productId);
    userManager.trackUserActivity('remove_from_cart', { productId });
};

const originalToggleWishlist = toggleWishlist;
toggleWishlist = function(productId) {
    const wasInWishlist = wishlistManager.isInWishlist(productId);
    originalToggleWishlist(productId);
    
    const action = wasInWishlist ? 'remove_from_wishlist' : 'add_to_wishlist';
    userManager.trackUserActivity(action, { productId });
};

// Initialize cart, inventory, wishlist and user system on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Initialize inventory management
    inventoryManager.initialize();
    
    // Initialize wishlist
    wishlistManager.updateWishlistCount();
    
    // Add wishlist buttons to all product cards that don't have them
    const productCards = document.querySelectorAll('.product-card[data-product-id]');
    productCards.forEach(card => {
        if (!card.querySelector('.wishlist-btn')) {
            const productId = card.dataset.productId;
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-btn';
            wishlistBtn.setAttribute('onclick', `toggleWishlist('${productId}')`);
            wishlistBtn.setAttribute('aria-label', 'Add to wishlist');
            wishlistBtn.innerHTML = '<span class="heart-icon">🤍</span>';
            card.appendChild(wishlistBtn);
        }
    });
    
    wishlistManager.updateWishlistButtons();
    
    // Initialize user system
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        userManager.updateUIForLoggedInUser(currentUser);
    } else {
        userManager.updateUIForLoggedOutUser();
    }
    
    // Track page view
    userManager.trackUserActivity('page_view');
    
    // Populate checkout summary if on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        populateCheckoutSummary();
        initializeCheckoutPage();
        
        // Handle form submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) {
                // The form will submit to Netlify automatically
                // Show a loading state
                const submitBtn = document.querySelector('.place-order-btn');
                if (submitBtn) {
                    submitBtn.textContent = 'Processing Order...';
                    submitBtn.disabled = true;
                }
            });
        }
        
        // Redirect if cart is empty
        if (cart.length === 0) {
            showCartNotification('Your cart is empty! Redirecting to products page...', 'info');
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 2000);
        }
    }
    
    // Close cart when clicking outside
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                toggleCart();
            }
        });
    }
    
    // Check if we need to highlight a product (from cart navigation)
    const highlightProductId = sessionStorage.getItem('highlightProduct');
    if (highlightProductId && window.location.pathname.includes('products.html')) {
        setTimeout(() => {
            const productCard = document.querySelector(`[data-product-id="${highlightProductId}"]`);
            if (productCard) {
                productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add highlight effect
                productCard.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.8)';
                productCard.style.transform = 'scale(1.02)';
                
                setTimeout(() => {
                    productCard.style.boxShadow = '';
                    productCard.style.transform = '';
                }, 2000);
            }
            
            // Clear the highlight flag
            sessionStorage.removeItem('highlightProduct');
        }, 1000);
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add loading animation for page transitions
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 30, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 215, 0, 0.3);
        border-top: 3px solid #ffd700;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    loader.appendChild(spinner);
    document.body.appendChild(loader);
    
    // Remove loader after a short delay
    setTimeout(() => {
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }, 800);
}

// Add loading animation to navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a, .btn-primary, .btn-secondary');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only add loading for actual page navigation
            if (this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                showLoadingAnimation();
            }
        });
    });
});

// Payment Integration
let stripe, card, paypalButtons;

// Initialize payment systems on checkout page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html')) {
        initializePaymentSystems();
        handlePaymentMethodSwitch();
    }
});

function initializePaymentSystems() {
    // Initialize Stripe
    initializeStripe();
    
    // Initialize PayPal
    initializePayPal();
    
    // Set default payment method
    showPaymentSection('stripe');
}

function initializeStripe() {
    // Demo public key - replace with your actual Stripe public key
    const stripePublicKey = 'pk_test_51H5...'; // This is a placeholder
    
    if (typeof Stripe !== 'undefined') {
        stripe = Stripe(stripePublicKey);
        const elements = stripe.elements();
        
        // Create card element
        card = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#5a4a37',
                    fontFamily: 'Georgia, serif',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#dc3545',
                    iconColor: '#dc3545'
                }
            }
        });
        
        // Mount card element
        card.mount('#card-element');
        
        // Handle real-time validation errors
        card.on('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }
}

function initializePayPal() {
    if (typeof paypal !== 'undefined') {
        paypalButtons = paypal.Buttons({
            createOrder: function(data, actions) {
                const cart = JSON.parse(localStorage.getItem('colp-cart')) || [];
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const shipping = total >= 100 ? 0 : 15;
                const finalTotal = total + shipping;
                
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: finalTotal.toFixed(2),
                            currency_code: 'USD'
                        },
                        description: 'COLP Fantasy Jewelry Order'
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Handle successful payment
                    handleSuccessfulPayment('paypal', {
                        orderId: details.id,
                        payerId: details.payer.payer_id,
                        amount: details.purchase_units[0].amount.value
                    });
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                showPaymentError('PayPal payment failed. Please try again.');
            }
        });
    }
}

function handlePaymentMethodSwitch() {
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            showPaymentSection(this.value);
        });
    });
}

function showPaymentSection(method) {
    // Hide all payment sections
    document.getElementById('stripe-card-section').classList.remove('active');
    document.getElementById('paypal-section').classList.remove('active');
    document.getElementById('bank-transfer-section').classList.remove('active');
    
    // Show selected payment section
    switch(method) {
        case 'stripe':
            document.getElementById('stripe-card-section').classList.add('active');
            break;
        case 'paypal':
            document.getElementById('paypal-section').classList.add('active');
            // Render PayPal buttons if not already rendered
            if (paypalButtons && !document.querySelector('#paypal-button-container .paypal-buttons')) {
                paypalButtons.render('#paypal-button-container');
            }
            break;
        case 'bank-transfer':
            document.getElementById('bank-transfer-section').classList.add('active');
            break;
    }
}

// Enhanced checkout form submission
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCheckoutSubmission();
        });
    }
});

async function handleCheckoutSubmission() {
    const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    
    if (!selectedPaymentMethod) {
        showPaymentError('Please select a payment method.');
        return;
    }
    
    // Show loading state
    showPaymentProcessing(true);
    
    switch(selectedPaymentMethod) {
        case 'stripe':
            await handleStripePayment();
            break;
        case 'paypal':
            // PayPal handled by their own buttons
            break;
        case 'bank-transfer':
            handleBankTransferOrder();
            break;
    }
}

async function handleStripePayment() {
    if (!stripe || !card) {
        showPaymentError('Payment system not initialized. Please refresh the page.');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('colp-cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total >= 100 ? 0 : 15;
    const finalTotal = total + shipping;
    
    const billingDetails = {
        name: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        address: {
            line1: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            postal_code: document.getElementById('zipCode').value,
            country: document.getElementById('country').value,
        }
    };
    
    // In a real application, you'd create a payment intent on your server
    // For demo purposes, we'll simulate the process
    setTimeout(() => {
        handleSuccessfulPayment('stripe', {
            paymentMethodId: 'pm_demo_' + Date.now(),
            amount: finalTotal
        });
    }, 2000);
}

function handleBankTransferOrder() {
    // For bank transfer, we just submit the form to capture the order
    setTimeout(() => {
        handleSuccessfulPayment('bank-transfer', {
            instructions: 'Bank transfer instructions sent to email'
        });
    }, 1000);
}

function handleSuccessfulPayment(method, paymentData) {
    showPaymentProcessing(false);
    
    // Clear cart
    localStorage.removeItem('colp-cart');
    updateCartCount();
    
    // Store order details for success page
    const orderDetails = {
        id: 'ORDER_' + Date.now(),
        method: method,
        paymentData: paymentData,
        timestamp: new Date().toISOString(),
        items: JSON.parse(localStorage.getItem('colp-cart')) || []
    };
    
    localStorage.setItem('last-order', JSON.stringify(orderDetails));
    
    // Redirect to success page
    window.location.href = 'order-success.html';
}

function showPaymentError(message) {
    showPaymentProcessing(false);
    
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #dc3545, #e74c3c);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10001;
        animation: slideIn 0.5s ease-out;
        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 500);
    }, 5000);
}

function showPaymentProcessing(show) {
    let processingDiv = document.getElementById('payment-processing');
    
    if (show) {
        if (!processingDiv) {
            processingDiv = document.createElement('div');
            processingDiv.id = 'payment-processing';
            processingDiv.className = 'payment-processing';
            processingDiv.innerHTML = `
                <div class="spinner"></div>
                <h3>Processing your payment...</h3>
                <p>Please don't close this window.</p>
            `;
            document.querySelector('.checkout-form').appendChild(processingDiv);
        }
        processingDiv.style.display = 'block';
        
        // Disable form
        const submitBtn = document.querySelector('.place-order-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }
    } else {
        if (processingDiv) {
            processingDiv.style.display = 'none';
        }
        
        // Re-enable form
        const submitBtn = document.querySelector('.place-order-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    }
}

// Checkout Page Initialization
function initializeCheckoutPage() {
    const currentUser = userManager.getCurrentUser();
    const userStatusSection = document.getElementById('userStatusSection');
    const savedAddressesSection = document.getElementById('savedAddressesSection');
    
    if (currentUser) {
        // User is logged in
        userStatusSection.innerHTML = `
            <div class="user-logged-in">
                <div class="user-info">
                    <span class="user-icon">👤</span>
                    <div class="user-details">
                        <h3>Welcome back, ${currentUser.firstName}!</h3>
                        <p>Logged in as ${currentUser.email}</p>
                    </div>
                </div>
                <div class="user-actions">
                    <button type="button" class="btn-secondary" onclick="logoutAndContinueAsGuest()">Continue as Guest</button>
                </div>
            </div>
        `;
        
        // Pre-fill contact information
        document.getElementById('firstName').value = currentUser.firstName || '';
        document.getElementById('lastName').value = currentUser.lastName || '';
        document.getElementById('email').value = currentUser.email || '';
        
        // Load saved addresses
        loadSavedAddressesForCheckout(currentUser.id);
        savedAddressesSection.style.display = 'block';
        
    } else {
        // User is not logged in
        userStatusSection.innerHTML = `
            <div class="guest-checkout">
                <div class="checkout-options">
                    <div class="option-card">
                        <h3>🚀 Quick Guest Checkout</h3>
                        <p>Continue without creating an account</p>
                        <small>You can create an account later to track your order</small>
                    </div>
                    <div class="option-divider">or</div>
                    <div class="option-card">
                        <h3>👤 Sign In / Register</h3>
                        <p>Access saved addresses and order history</p>
                        <a href="auth.html" class="btn-primary">Sign In</a>
                    </div>
                </div>
            </div>
        `;
        savedAddressesSection.style.display = 'none';
    }
}

// Load saved addresses for checkout
function loadSavedAddressesForCheckout(userId) {
    if (typeof addressManager === 'undefined') {
        return; // addressManager is defined in profile.js, might not be loaded
    }
    
    const addresses = addressManager.getUserAddresses(userId);
    const savedAddressesSelect = document.getElementById('savedAddresses');
    
    if (addresses.length === 0) {
        document.getElementById('savedAddressesSection').style.display = 'none';
        return;
    }
    
    // Clear existing options
    savedAddressesSelect.innerHTML = '<option value="">Choose a saved address or enter new one</option>';
    
    // Add address options
    addresses.forEach(address => {
        const option = document.createElement('option');
        option.value = address.id;
        option.textContent = `${address.title} - ${address.firstName} ${address.lastName}, ${address.city}, ${address.state}`;
        if (address.isDefault) {
            option.textContent += ' (Default)';
            option.selected = true;
        }
        savedAddressesSelect.appendChild(option);
    });
    
    // If there's a default address, auto-fill the form
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
        fillAddressForm(defaultAddress);
    }
}

// Handle saved address selection change
function handleSavedAddressChange() {
    const savedAddressesSelect = document.getElementById('savedAddresses');
    const selectedAddressId = savedAddressesSelect.value;
    
    if (!selectedAddressId) {
        clearAddressForm();
        return;
    }
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser || typeof addressManager === 'undefined') return;
    
    const addresses = addressManager.getUserAddresses(currentUser.id);
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    
    if (selectedAddress) {
        fillAddressForm(selectedAddress);
    }
}

// Fill address form with saved address data
function fillAddressForm(address) {
    document.getElementById('firstName').value = address.firstName;
    document.getElementById('lastName').value = address.lastName;
    document.getElementById('phone').value = address.phone || '';
    document.getElementById('address').value = address.street;
    document.getElementById('city').value = address.city;
    document.getElementById('state').value = address.state;
    document.getElementById('zipCode').value = address.zip;
    document.getElementById('country').value = address.country;
}

// Clear address form
function clearAddressForm() {
    document.getElementById('address').value = '';
    document.getElementById('city').value = '';
    document.getElementById('state').value = '';
    document.getElementById('zipCode').value = '';
    document.getElementById('country').value = '';
}

// Use new address (clear selection)
function useNewAddress() {
    document.getElementById('savedAddresses').value = '';
    clearAddressForm();
}

// Logout and continue as guest
function logoutAndContinueAsGuest() {
    if (confirm('Are you sure you want to continue as guest? You will lose access to saved addresses and order tracking.')) {
        userManager.logoutUser();
        initializeCheckoutPage();
        showCartNotification('Continuing as guest checkout', 'info');
    }
}