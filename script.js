document.addEventListener('DOMContentLoaded', function() {
    // Fetch product data and display products
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('product-list');
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                `;
                productList.appendChild(productCard);
            });

            // Add event listeners to all "Add to Cart" buttons
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    addToCart(this.getAttribute('data-id'));
                });
            });
        });

    // Initialize cart count on page load
    updateCartCount();
});

const cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productId) {
    productId = parseInt(productId); // Convert to number
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id === productId);
            const cartItem = cart.find(item => item.id === productId);

            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showNotification(); // Show notification when item is added to cart
        });
}

function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000); // Hide notification after 2 seconds
}

function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}
function showCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartTax = document.getElementById('cart-tax');
    const cartNet = document.getElementById('cart-net');

    cartItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" >
        <div class="cart-desc">
            <p>${item.quantity} x ${item.name}</p>
            <h3>$${itemTotal.toFixed(2)}</h3>
        </div>
        <div class="cart-controls">
            <button class="minus-btn" data-index="${index}">-</button>
            <button class="plus-btn" data-index="${index}">+</button>
        </div>
        `;
        cartItems.appendChild(itemElement);
    });

    const tax = subtotal * 0.13;
    cartTotal.textContent = `Total: $${subtotal.toFixed(2)}`;
    cartTax.textContent = `Tax (13%): $${tax.toFixed(2)}`;
    cartNet.textContent = `Total: $${(subtotal + tax).toFixed(2)}`;

    cartPopup.style.display = 'flex';

    // Add event listeners for the plus and minus buttons
    document.querySelectorAll('.plus-btn').forEach(button => {
        button.addEventListener('click', () => updateQuantity(button.dataset.index, 1));
    });

    document.querySelectorAll('.minus-btn').forEach(button => {
        button.addEventListener('click', () => updateQuantity(button.dataset.index, -1));
    });
}

function updateQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;

    if (item.quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.splice(index, 1);
    }

    showCartPopup(); // Refresh the popup with updated cart
}
document.getElementById('cart-button').addEventListener('click', showCartPopup);

document.querySelector('.close-cart').addEventListener('click', () => {
    document.getElementById('cart-popup').style.display = 'none';
});

document.getElementById('checkout').addEventListener('click', () => {
    if (cart.length > 0) {
        alert('Thank you for shopping with us!');
        localStorage.removeItem('cart'); // Clear the cart from localStorage
        cart.length = 0; // Clear the cart array in memory
        updateCartCount(); // Update the cart count displayed on the page
        document.getElementById('cart-popup').style.display = 'none';
    } else {
        alert('Your cart is empty!');
    }
});
