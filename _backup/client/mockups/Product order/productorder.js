document.addEventListener('DOMContentLoaded', () => {
    // Mock Orders Data
    const mockOrders = [
        {
            id: 'ORD-2024-001',
            date: '2024-02-09',
            products: 'Súp dinh dưỡng, Pate cho chó...',
            total: 52.00,
            status: 'pending',
            statusText: 'Đang xử lý'
        },
        {
            id: 'ORD-2024-002',
            date: '2024-02-01',
            products: 'Hạt Royal Canin, Đồ chơi xương...',
            total: 125.50,
            status: 'completed',
            statusText: 'Đã hoàn thành'
        },
        {
            id: 'ORD-2024-003',
            date: '2024-01-28',
            products: 'Dầu tắm SOS, Lược chải lông...',
            total: 45.00,
            status: 'cancelled',
            statusText: 'Đã hủy'
        },
        {
            id: 'ORD-2024-004',
            date: '2024-02-05',
            products: 'Balo vận chuyển thú cưng',
            total: 80.00,
            status: 'shipping',
            statusText: 'Đang giao hàng'
        }
    ];

    const ordersList = document.getElementById('orders-list');
    const emptyState = document.getElementById('empty-state');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Format currency
    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    // Render Orders
    const renderOrders = (filter = 'all') => {
        ordersList.innerHTML = '';
        
        const filteredOrders = filter === 'all' 
            ? mockOrders 
            : mockOrders.filter(order => order.status === filter);

        if (filteredOrders.length === 0) {
            ordersList.parentElement.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        ordersList.parentElement.style.display = 'table';
        emptyState.style.display = 'none';

        filteredOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Mã đơn hàng">
                    <a href="../Order detail/orderdetail.html?id=${order.id}" class="order-id-link">#${order.id}</a>
                </td>
                <td data-label="Ngày đặt">${order.date}</td>
                <td data-label="Sản phẩm">${order.products}</td>
                <td data-label="Tổng tiền" style="color: #FFB606; font-weight: bold;">${formatCurrency(order.total)}</td>
                <td data-label="Trạng thái">
                    <span class="status-badge status-${order.status}">${order.statusText}</span>
                </td>
                <td data-label="Hành động">
                    <a href="../Order detail/orderdetail.html?id=${order.id}" class="btn-view">
                        <i class="fas fa-eye"></i> Xem
                    </a>
                </td>
            `;
            ordersList.appendChild(tr);
        });
    };

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            renderOrders(btn.dataset.filter);
        });
    });

    // Initial Render
    renderOrders();
});
