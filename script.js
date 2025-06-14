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

// Enhanced mobile navigation
const createMobileMenu = () => {
    const navbar = document.querySelector('.navbar');
    const navMenu = document.querySelector('.nav-menu');
    
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-toggle')) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.style.cssText = `
            display: block;
            background: none;
            border: none;
            color: #DAA520;
            font-size: 2rem;
            cursor: pointer;
            padding: 0.5rem;
        `;
        
        navbar.querySelector('.nav-container').appendChild(mobileToggle);
        
        mobileToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'rgba(22, 22, 58, 0.95)';
            navMenu.style.padding = '1rem';
            navMenu.style.borderRadius = '0 0 10px 10px';
        });
    }
};

// Call mobile menu function on load and resize
window.addEventListener('load', createMobileMenu);
window.addEventListener('resize', createMobileMenu);

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

function addToCart(productId) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productCard) return;
    
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
    
    localStorage.setItem('colp-cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    
    // Show notification
    showCartNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
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
    if (cart.length === 0) return;
    
    // Redirect to checkout page instead of showing alert
    window.location.href = 'checkout.html';
}

function goToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #8B4513, #d4af37);
        color: #faf8f3;
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

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Populate checkout summary if on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        populateCheckoutSummary();
        
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
            alert('Your cart is empty! Redirecting to products page...');
            window.location.href = 'products.html';
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