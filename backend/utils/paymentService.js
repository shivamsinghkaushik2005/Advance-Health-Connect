import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Razorpay only if credentials are available
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Creates a new Razorpay order
 * @param {Number} amount - Amount in rupees (will be converted to paise)
 * @param {String} receipt - Receipt identifier
 * @returns {Promise} - Razorpay order object
 */
export const createOrder = async (amount, receipt) => {
  try {
    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !razorpay) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1 // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay create order error:', error);
    throw error;
  }
};

/**
 * Verifies Razorpay payment signature
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 * @returns {Boolean} - Whether signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_SECRET in .env file');
    }
    
    // Create the signature verification string
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    // Compare signatures
    return expectedSignature === signature;
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    throw error;
  }
};

/**
 * Refunds a payment
 * @param {String} paymentId - Razorpay payment ID to refund
 * @param {Object} options - Refund options (optional)
 * @returns {Promise} - Razorpay refund object
 */
export const refundPayment = async (paymentId, options = {}) => {
  try {
    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !razorpay) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
    }
    
    // Process refund
    const refund = await razorpay.payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    console.error('Razorpay refund error:', error);
    throw error;
  }
}; 