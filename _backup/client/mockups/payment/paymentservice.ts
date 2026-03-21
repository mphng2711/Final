// Payment Service Definition
// This file defines the types and interfaces for payment processing

export interface PaymentMethod {
    id: string;
    name: string;
    code: 'banking' | 'momo';
    icon: string;
}

export interface PaymentRequest {
    orderId: string;
    amount: number;
    description: string;
    method: 'banking' | 'momo';
}

export interface PaymentResponse {
    success: boolean;
    qrUrl?: string;
    transactionId?: string;
    message?: string;
}

export class PaymentService {
    private static readonly BANK_ID = 'ICB'; // VietinBank
    private static readonly ACCOUNT_NO = '100872677547';
    private static readonly ACCOUNT_NAME = 'NGUYEN DINH TIEN';
    private static readonly TEMPLATE = 'compact2'; // VietQR template

    constructor() {}

    /**
     * Generate VietQR URL for Banking
     */
    generateVietQR(amount: number, content: string): string {
        // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
        const baseUrl = `https://img.vietqr.io/image/${PaymentService.BANK_ID}-${PaymentService.ACCOUNT_NO}-${PaymentService.TEMPLATE}.png`;
        const params = new URLSearchParams({
            amount: amount.toString(),
            addInfo: content,
            accountName: PaymentService.ACCOUNT_NAME
        });
        
        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * Simulate Momo QR Generation (In real app, call Momo API)
     */
    generateMomoQR(amount: number, content: string): string {
        // Return a placeholder QR for Momo
        // Using a generic QR generator for demo purposes
        const momoData = `momo://pay?amount=${amount}&msg=${content}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(momoData)}`;
    }

    /**
     * Process Payment Request
     */
    async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            let qrUrl = '';
            
            if (request.method === 'banking') {
                qrUrl = this.generateVietQR(request.amount, request.description);
            } else if (request.method === 'momo') {
                qrUrl = this.generateMomoQR(request.amount, request.description);
            }

            return {
                success: true,
                qrUrl: qrUrl,
                transactionId: `TRANS_${Date.now()}`,
                message: 'QR Code generated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to generate payment QR'
            };
        }
    }
}
