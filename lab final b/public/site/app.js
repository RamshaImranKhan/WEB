const API_BASE = '/api';

async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('token');

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  };

  if (options.body) {
    if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else {
      config.body = options.body;
    }
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || 'API request failed');
  }

  if (endpoint.includes('/users/login') || endpoint.includes('/users/register')) {
    return data;
  }

  if (endpoint.includes('/admin/')) {
    return data;
  }

  return data.products || data.orders || data.cart || data.categories || data.user || data;
}

const storage = {
  saveAuth(data) {
    const token = data.token;
    const user = data.user;

    if (token) {
      localStorage.setItem('token', token);
    }

    if (user && typeof user === 'object') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  getAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return { token, user: user ? JSON.parse(user) : null };
  },
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  },
  saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  },
  clearCart() {
    localStorage.removeItem('cart');
  },
};

function ensureAuthOrRedirect() {
  const auth = storage.getAuth();
  if (!auth.token) {
    window.location.href = '/login';
  }
}

function hydrateUserBadge(elementId) {
  const auth = storage.getAuth();
  const element = document.getElementById(elementId);
  if (element && auth.user) {
    element.textContent = auth.user.name || auth.user.email;
  }
}

async function addToCart(product, quantity = 1) {
  if (!product || !product._id) {
    return;
  }

  const cart = storage.getCart();
  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      _id: product._id,
      name: product.name || 'Product',
      price: product.price || 0,
      image: product.image || '',
      quantity: quantity
    });
  }

  storage.saveCart(cart);
  updateCartBadge();

  const auth = storage.getAuth();
  if (auth.token) {
    try {
      await api('/cart', {
        method: 'POST',
        body: { productId: product._id, quantity: existing ? existing.quantity : quantity },
      });
    } catch (err) {
      console.error(err);
    }
  }

  showNotification(`${product.name || 'Product'} added to cart!`, 'success');
}

function updateCartBadge() {
  const cart = storage.getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });

  document.querySelectorAll('.cart-link').forEach(link => {
    if (totalItems > 0) {
      link.innerHTML = `Cart (${totalItems})`;
    } else {
      link.innerHTML = 'Cart';
    }
  });
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.cart-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `cart-notification alert alert-${type === 'success' ? 'success' : 'info'}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

if (!document.querySelector('#cart-animations')) {
  const style = document.createElement('style');
  style.id = 'cart-animations';
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
    .cart-badge {
      background: #8B4513;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      margin-left: 5px;
    }
  `;
  document.head.appendChild(style);
}

function renderCart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cart = storage.getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <p class="text-muted mb-3">Your cart is empty.</p>
        <a href="/menu" class="btn btn-outline-dark">Browse Menu</a>
      </div>
    `;
    updateCartBadge();
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  container.innerHTML = `
    <div class="cart-items">
      ${cart.map((item, index) => `
        <div class="cart-item d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-right: 15px;">` : ''}
          <div class="flex-grow-1">
            <strong>${item.name || 'Product'}</strong>
            <small class="text-muted d-block">$${(item.price || 0).toFixed(2)} each</small>
            <div class="mt-2 d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary quantity-btn" data-index="${index}" data-action="decrease">-</button>
              <span class="quantity-display" style="min-width: 30px; text-align: center;">${item.quantity || 1}</span>
              <button class="btn btn-sm btn-outline-secondary quantity-btn" data-index="${index}" data-action="increase">+</button>
            </div>
          </div>
          <div class="d-flex flex-column align-items-end gap-2">
            <strong class="item-total">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</strong>
            <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">Remove</button>
          </div>
        </div>
      `).join('')}
      <div class="mt-4 pt-3 border-top">
        <div class="d-flex justify-content-between align-items-center">
          <h5>Total:</h5>
          <h4 class="text-primary">$${total.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.dataset.index);
      const action = this.dataset.action;
      const cart = storage.getCart();

      if (index >= 0 && index < cart.length) {
        if (action === 'increase') {
          cart[index].quantity = (cart[index].quantity || 1) + 1;
        } else if (action === 'decrease') {
          cart[index].quantity = Math.max(1, (cart[index].quantity || 1) - 1);
        }
        storage.saveCart(cart);
        renderCart(containerId);
        updateCartBadge();
      }
    });
  });

  container.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.dataset.index);
      const cart = storage.getCart();
      const itemName = cart[index]?.name || 'Item';
      cart.splice(index, 1);
      storage.saveCart(cart);
      renderCart(containerId);
      updateCartBadge();
      showNotification(`${itemName} removed from cart`, 'info');
    });
  });

  updateCartBadge();
}

async function loadCartFromServer() {
  const auth = storage.getAuth();
  if (!auth.token) return;

  try {
    const data = await api('/cart');
    if (data.cart && data.cart.items) {
      const cart = data.cart.items.map(item => ({
        _id: item.product._id || item.product,
        name: item.product.name || 'Product',
        price: item.price,
        quantity: item.quantity,
      }));
      storage.saveCart(cart);
    }
  } catch (err) {
    console.error(err);
  }
}

function handleCartClick(event) {
  if (event) event.preventDefault();
  window.location.href = '/cart';
  return false;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadCartFromServer();
    updateCartBadge();
  });
} else {
  loadCartFromServer();
  updateCartBadge();
}
