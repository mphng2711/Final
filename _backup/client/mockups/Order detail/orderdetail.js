document.addEventListener('DOMContentLoaded', () => {
    // Mock Order Data (Trong thực tế sẽ lấy từ API hoặc URL parameter)
    const mockOrder = {
        id: 'ORD-2024-001',
        date: '2024-02-09',
        status: 'pending', // pending, shipping, completed, cancelled
        statusText: 'Đang xử lý',
        customer: {
            name: 'Nguyễn Văn A',
            phone: '0909 123 456',
            email: 'nguyenvana@example.com'
        },
        shipping: {
            address: '07 Cửu Long, P. Hòa Hưng, TP. Hồ Chí Minh',
            method: 'Giao hàng tiêu chuẩn',
            payment: 'Thanh toán khi nhận hàng (COD)'
        },
        items: [
            {
                id: 1,
                name: 'Súp dinh dưỡng cho chó LaPaw Gourmet 170g',
                price: 25.00,
                quantity: 2,
                image: 'https://via.placeholder.com/60'
            },
            {
                id: 2,
                name: 'Pate cho chó mọi lứa tuổi laPaw vị bò và rau củ 375g',
                price: 25.00,
                quantity: 1,
                image: 'https://via.placeholder.com/60'
            }
        ],
        shippingFee: 2.00
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    // Render Order Details
    const renderOrderDetail = (order) => {
        // Order Header
        document.getElementById('order-id').textContent = order.id;
        const statusBadge = document.getElementById('order-status-badge');
        statusBadge.textContent = order.statusText;
        statusBadge.className = `order-status status-${order.status}`;

        // Customer Info
        document.getElementById('customer-info').innerHTML = `
            <p><strong>Họ tên:</strong> ${order.customer.name}</p>
            <p><strong>Số điện thoại:</strong> ${order.customer.phone}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Ngày đặt:</strong> ${order.date}</p>
        `;

        // Shipping Info
        document.getElementById('shipping-info').innerHTML = `
            <p><strong>Địa chỉ:</strong> ${order.shipping.address}</p>
            <p><strong>Phương thức:</strong> ${order.shipping.method}</p>
            <p><strong>Thanh toán:</strong> ${order.shipping.payment}</p>
        `;

        // Order Items
        const itemsContainer = document.getElementById('order-items');
        let subtotal = 0;

        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Sản phẩm">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${item.image}" alt="${item.name}" class="order-item-img" onerror="this.src='https://via.placeholder.com/60?text=No+Image'">
                        <div class="cart-item-name">${item.name}</div>
                    </div>
                </td>
                <td data-label="Đơn giá" class="item-price">${formatCurrency(item.price)}</td>
                <td data-label="Số lượng">${item.quantity}</td>
                <td data-label="Thành tiền" class="item-price">${formatCurrency(itemTotal)}</td>
            `;
            itemsContainer.appendChild(tr);
        });

        // Summary
        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('shipping-fee').textContent = formatCurrency(order.shippingFee);
        document.getElementById('total-price').textContent = formatCurrency(subtotal + order.shippingFee);
    };

    // Run render
    renderOrderDetail(mockOrder);
});
