/**
 * Frontend Mentor: Product list with cart
 * კალათის და პროდუქტების მართვის ფუნქციონალი
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- State (კალათის მდგომარეობა) ----------
  const cart = new Map();

  // ---------- DOM Elements ----------
  const productsGrid = document.querySelector('.products-grid');
  const cartCountEl = document.querySelector('.cart__count');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartActiveEl = document.getElementById('cart-active');
  const cartItemsListEl = document.getElementById('cart-items-list');
  const cartTotalAmountEl = document.getElementById('cart-total-amount');
  const btnConfirmOrder = document.getElementById('btn-confirm-order');

  // Modal Elements
  const modalEl = document.getElementById('confirmation-modal');
  const modalItemsListEl = document.getElementById('modal-items-list');
  const modalTotalAmountEl = document.getElementById('modal-total-amount');
  const btnStartNewOrder = document.getElementById('btn-start-new-order');

  // ---------- Helpers ----------
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  const getCartTotals = () => {
    let totalCount = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
      totalCount += item.quantity;
      totalPrice += item.quantity * item.price;
    });

    return { totalCount, totalPrice };
  };

  // ---------- Update Single Product Card in Grid ----------
  const updateProductCardUI = (productId) => {
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!card) return;

    const btnIdle = card.querySelector('.btn-cart--idle');
    const btnSelected = card.querySelector('.btn-cart--selected');
    const qtyValue = card.querySelector('.btn-cart__qty-value');

    const item = cart.get(productId);

    if (item && item.quantity > 0) {
      card.classList.add('is-selected');
      btnIdle.style.display = 'none';
      btnSelected.style.display = 'flex';
      qtyValue.textContent = item.quantity;
    } else {
      card.classList.remove('is-selected');
      btnIdle.style.display = 'flex';
      btnSelected.style.display = 'none';
      qtyValue.textContent = '1';
    }
  };

  // ---------- Render Cart UI ----------
  const renderCart = () => {
    const { totalCount, totalPrice } = getCartTotals();

    // განვაახლოთ რაოდენობის მაჩვენებელი სათაურში
    cartCountEl.textContent = totalCount;

    if (totalCount === 0) {
      cartEmptyEl.style.display = 'block';
      cartActiveEl.style.display = 'none';
      cartItemsListEl.innerHTML = '';
      return;
    }

    cartEmptyEl.style.display = 'none';
    cartActiveEl.style.display = 'block';

    // ჩავაშენოთ პროდუქტები კალათაში
    cartItemsListEl.innerHTML = '';

    cart.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'cart__item';
      li.setAttribute('data-id', item.id);

      li.innerHTML = `
        <div class="cart__item-details">
          <span class="cart__item-name">${item.name}</span>
          <div class="cart__item-meta">
            <span class="cart__item-qty">${item.quantity}x</span>
            <span class="cart__item-unit-price">@ ${formatCurrency(item.price)}</span>
            <span class="cart__item-total-price">${formatCurrency(item.quantity * item.price)}</span>
          </div>
        </div>
        <button type="button" class="cart__item-remove" aria-label="Remove ${item.name} from cart" data-action="remove" data-id="${item.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10" aria-hidden="true">
            <path fill="currentColor" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
          </svg>
        </button>
      `;

      cartItemsListEl.appendChild(li);
    });

    cartTotalAmountEl.textContent = formatCurrency(totalPrice);
  };

  // ---------- Cart Operations ----------
  const addToCart = (productId) => {
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!card) return;

    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const category = card.dataset.category;
    const thumbnail = card.dataset.thumbnail;

    cart.set(productId, {
      id: productId,
      name,
      price,
      category,
      thumbnail,
      quantity: 1
    });

    updateProductCardUI(productId);
    renderCart();
  };

  const changeQuantity = (productId, delta) => {
    const item = cart.get(productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      cart.delete(productId);
    } else {
      item.quantity = newQuantity;
    }

    updateProductCardUI(productId);
    renderCart();
  };

  const removeFromCart = (productId) => {
    cart.delete(productId);
    updateProductCardUI(productId);
    renderCart();
  };

  // ---------- Modal Operations ----------
  const openConfirmationModal = () => {
    const { totalPrice } = getCartTotals();
    modalItemsListEl.innerHTML = '';

    cart.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'modal-summary__item';

      li.innerHTML = `
        <div class="modal-summary__left">
          <img src="${item.thumbnail}" alt="${item.name}" class="modal-summary__thumbnail">
          <div class="modal-summary__details">
            <span class="modal-summary__name">${item.name}</span>
            <div class="modal-summary__meta">
              <span class="modal-summary__qty">${item.quantity}x</span>
              <span class="modal-summary__unit-price">@ ${formatCurrency(item.price)}</span>
            </div>
          </div>
        </div>
        <span class="modal-summary__total">${formatCurrency(item.quantity * item.price)}</span>
      `;

      modalItemsListEl.appendChild(li);
    });

    modalTotalAmountEl.textContent = formatCurrency(totalPrice);
    modalEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // ფოკუსი გადავიტანოთ ღილაკზე მოდალის გახსნისას
    btnStartNewOrder.focus();
  };

  const closeConfirmationModal = () => {
    modalEl.style.display = 'none';
    document.body.style.overflow = '';
  };

  const resetAll = () => {
    // გავასუფთაოთ კალათა
    cart.clear();

    // ყველა პროდუქტის ბარათი დავაბრუნოთ საწყის მდგომარეობაში
    document.querySelectorAll('.product-card').forEach((card) => {
      const id = card.dataset.id;
      updateProductCardUI(id);
    });

    renderCart();
    closeConfirmationModal();
  };

  // ---------- Event Listeners ----------

  // პროდუქტების ბადეზე ივენთების დელეგირება (Add to Cart, Increase, Decrease)
  if (productsGrid) {
    productsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;

      const productId = card.dataset.id;

      // Add to Cart დაჭერა
      const btnIdle = e.target.closest('.btn-cart--idle');
      if (btnIdle) {
        addToCart(productId);
        return;
      }

      // Quantity Increase (+) დაჭერა
      const btnIncrement = e.target.closest('.btn-qty--increment');
      if (btnIncrement) {
        changeQuantity(productId, 1);
        return;
      }

      // Quantity Decrease (-) დაჭერა
      const btnDecrement = e.target.closest('.btn-qty--decrement');
      if (btnDecrement) {
        changeQuantity(productId, -1);
        return;
      }
    });
  }

  // კალათიდან პროდუქტის წაშლა (Remove button)
  if (cartItemsListEl) {
    cartItemsListEl.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-action="remove"]');
      if (removeBtn) {
        const productId = removeBtn.dataset.id;
        removeFromCart(productId);
      }
    });
  }

  // შეკვეთის დადასტურება
  if (btnConfirmOrder) {
    btnConfirmOrder.addEventListener('click', () => {
      if (cart.size > 0) {
        openConfirmationModal();
      }
    });
  }

  // ახალი შეკვეთის დაწყება (მოდალის დახურვა და რესეტი)
  if (btnStartNewOrder) {
    btnStartNewOrder.addEventListener('click', resetAll);
  }

  // ESC ღილაკით მოდალის დახურვა
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.style.display === 'flex') {
      closeConfirmationModal();
    }
  });

  // მოდალის გარეთ დაწკაპუნებით დახურვა
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) {
      closeConfirmationModal();
    }
  });

  // საწყისი რენდერი
  renderCart();
});
