/**
 * Payment Page Logic
 * Handles UI interactions and integrates with PaymentService (simulated)
 */

// Simulation of PaymentService from TypeScript file
class PaymentServiceJS {
    constructor() {
        this.BANK_ID = 'ICB';
        this.ACCOUNT_NO = '100872677547';
        this.ACCOUNT_NAME = 'NGUYEN DINH TIEN';
        this.TEMPLATE = 'compact2';
    }

    generateVietQR(amount, content) {
        const baseUrl = `https://img.vietqr.io/image/${this.BANK_ID}-${this.ACCOUNT_NO}-${this.TEMPLATE}.png`;
        const params = new URLSearchParams({
            amount: amount.toString(),
            addInfo: content,
            accountName: this.ACCOUNT_NAME
        });
        return `${baseUrl}?${params.toString()}`;
    }

    generateMomoQR(amount, content) {
        // Placeholder Momo QR
        const momoData = `momo://pay?amount=${amount}&msg=${content}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(momoData)}`;
    }
}

const paymentService = new PaymentServiceJS();
let currentMethod = 'banking';
let orderAmount = 0;
let finalAmount = 0;
let orderId = '';
let discount = 0;

// Mock Vouchers
const VOUCHERS = {
    'VSA10': 0.1, // 10% off
    'VSA20': 0.2, // 20% off
    'FREESHIP': 30000 // 30k off
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Order Data (Simulated from localStorage or URL)
    loadOrderData();

    // 2. Select default method
    selectPaymentMethod('banking');
});

function loadOrderData() {
    // Simulate getting total from cart
    // In a real app, this would come from localStorage or API
    const cartTotal = localStorage.getItem('vsa_pet_cart_total');
    orderAmount = cartTotal ? parseInt(cartTotal) : 550000; // Default fallback
    finalAmount = orderAmount;
    
    // Generate random Order ID
    orderId = 'VSA' + Math.floor(Math.random() * 1000000);

    updatePriceDisplay();
    document.getElementById('payment-content').textContent = orderId;
}

function updatePriceDisplay() {
    document.getElementById('subtotal').textContent = formatCurrency(orderAmount);
    
    if (discount > 0) {
        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('discount-amount').textContent = '-' + formatCurrency(discount);
    } else {
        document.getElementById('discount-row').style.display = 'none';
    }

    finalAmount = Math.max(0, orderAmount - discount);
    document.getElementById('total-amount').textContent = formatCurrency(finalAmount);
    document.getElementById('payment-amount').textContent = formatCurrency(finalAmount);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function selectPaymentMethod(method) {
    currentMethod = method;
    
    // Update UI active state
    document.querySelectorAll('.payment-method-item').forEach(item => {
        item.classList.remove('active');
        const input = item.querySelector('input');
        if (input.value === method) {
            item.classList.add('active');
            input.checked = true;
        }
    });

    // Hide QR area if switching methods (force user to click Pay again)
    document.getElementById('qr-area').classList.remove('show');
    document.getElementById('btn-pay').disabled = false;
    document.getElementById('btn-pay').innerHTML = '<i class="fas fa-lock"></i> Thanh toán ngay';
}

function applyVoucher() {
    const input = document.getElementById('voucher-input');
    const message = document.getElementById('voucher-message');
    const code = input.value.trim().toUpperCase();

    if (!code) {
        message.textContent = 'Vui lòng nhập mã giảm giá';
        message.className = 'voucher-message voucher-error';
        return;
    }

    if (VOUCHERS[code] !== undefined) {
        const value = VOUCHERS[code];
        if (value < 1) {
            // Percentage
            discount = orderAmount * value;
            message.textContent = `Áp dụng mã ${code} thành công: Giảm ${(value * 100)}%`;
        } else {
            // Fixed amount
            discount = value;
            message.textContent = `Áp dụng mã ${code} thành công: Giảm ${formatCurrency(value)}`;
        }
        message.className = 'voucher-message voucher-success';
        updatePriceDisplay();
    } else {
        discount = 0;
        updatePriceDisplay();
        message.textContent = 'Mã giảm giá không hợp lệ';
        message.className = 'voucher-message voucher-error';
    }
}

function validateForm() {
    const requiredFields = [
        { id: 'fullname', name: 'Họ và tên' },
        { id: 'phone', name: 'Số điện thoại' },
        { id: 'city', name: 'Tỉnh/Thành phố' },
        { id: 'district', name: 'Quận/Huyện' },
        { id: 'address', name: 'Địa chỉ cụ thể' }
    ];

    for (const field of requiredFields) {
        const el = document.getElementById(field.id);
        if (!el.value.trim()) {
            alert(`Vui lòng nhập ${field.name}`);
            el.focus();
            return false;
        }
    }

    // Basic phone validation
    const phone = document.getElementById('phone').value;
    if (!/^\d{10,11}$/.test(phone)) {
        alert('Số điện thoại không hợp lệ');
        document.getElementById('phone').focus();
        return false;
    }

    return true;
}

function processPayment() {
    // 1. Validate Form First
    if (!validateForm()) return;

    const btnPay = document.getElementById('btn-pay');
    const qrArea = document.getElementById('qr-area');
    const qrImg = document.getElementById('qr-img');

    // Disable button
    btnPay.disabled = true;
    btnPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo mã QR...';

    // Get Customer Info (optional: include in QR content or save to DB)
    const fullname = document.getElementById('fullname').value;
    const phone = document.getElementById('phone').value;
    // In real app, send this data to backend here

    // Simulate API delay
    setTimeout(() => {
        let qrUrl = '';
        // Use Order ID + Phone as content for easier tracking
        const content = `${orderId} ${phone}`;

        if (currentMethod === 'banking') {
            qrUrl = paymentService.generateVietQR(finalAmount, content);
            // Update bank info visibility
            document.querySelector('.bank-info').style.display = 'block';
            document.getElementById('payment-content').textContent = content;
        } else {
            qrUrl = paymentService.generateMomoQR(finalAmount, content);
            // Hide bank info for Momo (or show Momo specific info)
            document.querySelector('.bank-info').style.display = 'none';
        }

        // Show QR
        qrImg.src = qrUrl;
        qrArea.classList.add('show');
        
        // Update button
        btnPay.innerHTML = '<i class="fas fa-check"></i> Đã tạo mã thanh toán';
        
        // Start countdown
        startTimer(600); // 10 minutes

        // Scroll to QR
        qrArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1000);
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.querySelector('#countdown');
    
    // Clear existing timer if any
    if (window.paymentTimer) clearInterval(window.paymentTimer);

    window.paymentTimer = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(window.paymentTimer);
            display.textContent = "Hết hạn";
            alert("Mã QR đã hết hạn. Vui lòng tạo lại.");
            location.reload();
        }
    }, 1000);
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Đã sao chép: ' + text);
    }).catch(err => {
        console.error('Không thể sao chép', err);
    });
}
