// Food Order App JavaScript

// Data
const dishes = {
    sweet: [
        {
            id: 1,
            name: 'Chocolate Lava Cake',
            description: 'Rich chocolate cake with molten center',
            price: 8.99,
            icon: '🍫'
        },
        {
            id: 2,
            name: 'Tiramisu',
            description: 'Classic Italian coffee-flavored dessert',
            price: 7.99,
            icon: '🍰'
        },
        {
            id: 3,
            name: 'Crème Brûlée',
            description: 'Creamy custard with caramelized sugar top',
            price: 9.99,
            icon: '🍮'
        },
        {
            id: 4,
            name: 'Fruit Tart',
            description: 'Fresh seasonal fruits on pastry cream',
            price: 10.99,
            icon: '🥧'
        },
        {
            id: 5,
            name: 'Cheesecake',
            description: 'New York style creamy cheesecake',
            price: 8.49,
            icon: '🍰'
        },
        {
            id: 6,
            name: 'Macarons',
            description: 'Assorted French macarons (6 pieces)',
            price: 12.99,
            icon: '🍪'
        }
    ],
    savoury: [
        {
            id: 7,
            name: 'Grilled Chicken',
            description: 'Marinated grilled chicken breast',
            price: 14.99,
            icon: '🍗'
        },
        {
            id: 8,
            name: 'Beef Tacos',
            description: 'Three soft tacos with seasoned beef',
            price: 12.99,
            icon: '🌮'
        },
        {
            id: 9,
            name: 'Margherita Pizza',
            description: 'Classic tomato, mozzarella, and basil',
            price: 15.99,
            icon: '🍕'
        },
        {
            id: 10,
            name: 'Caesar Salad',
            description: 'Romaine lettuce with Caesar dressing',
            price: 9.99,
            icon: '🥗'
        },
        {
            id: 11,
            name: 'Pasta Carbonara',
            description: 'Creamy pasta with bacon and parmesan',
            price: 13.99,
            icon: '🍝'
        },
        {
            id: 12,
            name: 'Hamburger Deluxe',
            description: 'Beef patty with all the fixings',
            price: 11.99,
            icon: '🍔'
        }
    ]
};

// Shopping cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const cartBtn = document.querySelector('.cart-btn');
const cartModal = document.getElementById('cart-modal');
const quotationModal = document.getElementById('quotation-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const closeQuotationBtn = document.querySelector('.close-quotation');
const getQuotationBtn = document.getElementById('get-quotation');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    renderDishes();
    updateCartCount();
    initEventListeners();
    initForms();
});

// Carousel functionality
function initCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.carousel-indicators button');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    
    if (!carouselItems.length) return;

    let currentSlide = 0;
    const totalSlides = carouselItems.length;

    function showSlide(index) {
        carouselItems.forEach((item, i) => {
            item.classList.remove('active');
            if (indicators[i]) {
                indicators[i].classList.remove('active');
                indicators[i].setAttribute('aria-selected', 'false');
            }
        });

        if (index >= totalSlides) currentSlide = 0;
        if (index < 0) currentSlide = totalSlides - 1;

        carouselItems[currentSlide].classList.add('active');
        if (indicators[currentSlide]) {
            indicators[currentSlide].classList.add('active');
            indicators[currentSlide].setAttribute('aria-selected', 'true');
        }
    }

    function nextSlide() {
        currentSlide++;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide--;
        showSlide(currentSlide);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // Auto-advance carousel every 5 seconds
    setInterval(nextSlide, 5000);
}

// Render dishes
function renderDishes() {
    const sweetContainer = document.getElementById('sweet-dishes');
    const savouryContainer = document.getElementById('savoury-dishes');

    if (sweetContainer) {
        sweetContainer.innerHTML = dishes.sweet.map(dish => createDishCard(dish)).join('');
    }

    if (savouryContainer) {
        savouryContainer.innerHTML = dishes.savoury.map(dish => createDishCard(dish)).join('');
    }

    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dishId = parseInt(e.target.dataset.id);
            addToCart(dishId);
        });
    });
}

// Create dish card HTML
function createDishCard(dish) {
    const inCart = cart.some(item => item.id === dish.id);
    return `
        <div class="dish-card">
            <div class="dish-image" aria-hidden="true">
                ${dish.icon}
            </div>
            <div class="dish-content">
                <h4>${dish.name}</h4>
                <p>${dish.description}</p>
                <div class="dish-footer">
                    <span class="dish-price">$${dish.price.toFixed(2)}</span>
                    <button class="add-to-cart" data-id="${dish.id}" ${inCart ? 'disabled' : ''} aria-label="Add ${dish.name} to cart">
                        ${inCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Add item to cart
function addToCart(dishId) {
    const allDishes = [...dishes.sweet, ...dishes.savoury];
    const dish = allDishes.find(d => d.id === dishId);
    
    if (!dish) return;

    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...dish, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    renderDishes(); // Re-render to update button states
    showNotification(`${dish.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(dishId) {
    cart = cart.filter(item => item.id !== dishId);
    saveCart();
    updateCartCount();
    renderCartItems();
    renderDishes(); // Re-render to update button states
}

// Update item quantity
function updateQuantity(dishId, change) {
    const item = cart.find(item => item.id === dishId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(dishId);
        return;
    }

    saveCart();
    updateCartCount();
    renderCartItems();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count
function updateCartCount() {
    const cartCounts = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCounts.forEach(count => {
        count.textContent = totalItems;
    });

    // Enable/disable quotation button
    if (getQuotationBtn) {
        getQuotationBtn.disabled = cart.length === 0;
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const totalAmount = document.getElementById('total-amount');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotal) cartTotal.hidden = true;
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Decrease quantity">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name} from cart">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (cartTotal && totalAmount) {
        cartTotal.hidden = false;
        totalAmount.textContent = total.toFixed(2);
    }
}

// Show cart modal
function showCart() {
    renderCartItems();
    if (cartModal) {
        cartModal.hidden = false;
        cartModal.querySelector('.close-modal').focus();
    }
}

// Hide cart modal
function hideCart() {
    if (cartModal) {
        cartModal.hidden = true;
    }
}

// Show quotation modal
function showQuotationModal() {
    const quotationItems = document.getElementById('quotation-items');
    
    if (!quotationItems) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    quotationItems.innerHTML = cart.map(item => `
        <div class="quotation-item">
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('') + `
        <div class="quotation-item" style="font-weight: bold; border-top: 2px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem;">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;

    hideCart();
    if (quotationModal) {
        quotationModal.hidden = false;
        quotationModal.querySelector('#customer-name').focus();
    }
}

// Hide quotation modal
function hideQuotationModal() {
    if (quotationModal) {
        quotationModal.hidden = true;
    }
}

// Initialize event listeners
function initEventListeners() {
    // Cart button
    if (cartBtn) {
        cartBtn.addEventListener('click', showCart);
    }

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', hideCart);
    });

    if (closeQuotationBtn) {
        closeQuotationBtn.addEventListener('click', hideQuotationModal);
    }

    // Get quotation button
    if (getQuotationBtn) {
        getQuotationBtn.addEventListener('click', showQuotationModal);
    }

    // Close modals when clicking outside
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) hideCart();
        });
    }

    if (quotationModal) {
        quotationModal.addEventListener('click', (e) => {
            if (e.target === quotationModal) hideQuotationModal();
        });
    }

    // Mobile navigation toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            const isExpanded = navToggle.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Close mobile menu when clicking a link
    if (navMenu) {
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (navToggle) {
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideCart();
            hideQuotationModal();
        }
    });
}

// Initialize forms
function initForms() {
    // Quotation form
    const quotationForm = document.getElementById('quotation-form');
    if (quotationForm) {
        quotationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(quotationForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                deliveryDate: formData.get('deliveryDate'),
                requests: formData.get('requests'),
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };

            console.log('Quotation request:', data);
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            hideQuotationModal();
            showNotification('Quotation request submitted successfully! We will contact you soon.');
            quotationForm.reset();
        });
    }

    // Review form
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(reviewForm);
            const data = {
                name: formData.get('name'),
                rating: formData.get('rating'),
                review: formData.get('review')
            };

            console.log('Review submitted:', data);
            showNotification('Thank you for your review!');
            reviewForm.reset();
        });
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            console.log('Contact form submitted:', data);
            showNotification('Message sent successfully! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
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
`;
document.head.appendChild(style);

// Expose functions globally for inline event handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
