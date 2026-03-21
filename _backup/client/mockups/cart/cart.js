document.addEventListener('DOMContentLoaded', () => {
    const CART_STORAGE_KEY = 'vsa_pet_cart';
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const cartContent = document.getElementById('cart-content');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // Helper to format currency
    const formatCurrency = (amount) => {
        // Remove non-numeric characters if present (like $) for calculation, but formatting logic depends on input
        // Assuming price stored might be "$25.00" or just number
        let numericAmount = parseFloat(amount.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(numericAmount)) numericAmount = 0;
        return numericAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const getNumericPrice = (priceStr) => {
        return parseFloat(priceStr.toString().replace(/[^0-9.]/g, '')) || 0;
    };

    const renderCart = () => {
        const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');

        if (cart.length === 0) {
            cartContent.style.display = 'none';
            emptyCartMessage.style.display = 'block';
            return;
        }

        cartContent.style.display = 'block';
        emptyCartMessage.style.display = 'none';
        cartItemsContainer.innerHTML = '';

        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = getNumericPrice(item.price) * item.quantity;
            total += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Sản phẩm">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
                        <div class="cart-item-name">${item.name}</div>
                    </div>
                </td>
                <td data-label="Giá" class="cart-item-price">${item.price}</td>
                <td data-label="Số lượng">
                    <div class="quantity-control">
                        <button class="btn-quantity" onclick="updateQuantity(${index}, -1)">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, 0, this.value)">
                        <button class="btn-quantity" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td data-label="Tổng" class="cart-item-price">${formatCurrency(itemTotal)}</td>
                <td data-label="Xóa">
                    <button class="btn-remove" onclick="removeItem(${index})"><i class="fas fa-trash"></i> Xóa</button>
                </td>
            `;
            cartItemsContainer.appendChild(tr);
        });

        cartTotalPriceElement.textContent = formatCurrency(total);
    };

    window.updateQuantity = (index, change, manualValue = null) => {
        let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        
        if (manualValue !== null) {
            const newVal = parseInt(manualValue);
            if (newVal > 0) {
                cart[index].quantity = newVal;
            }
        } else {
            cart[index].quantity += change;
        }

        if (cart[index].quantity < 1) {
            // Confirm removal if quantity drops to 0
            if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                cart.splice(index, 1);
            } else {
                cart[index].quantity = 1;
            }
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        renderCart();
    };

    window.removeItem = (index) => {
        if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
            cart.splice(index, 1);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            renderCart();
        }
    };

    // Initial render
    renderCart();
});
