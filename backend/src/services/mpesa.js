const axios = require('axios');

/**
 * M-PESA Daraja API Service
 * Handles all M-PESA integration including OAuth, STK Push, and queries
 */

class MpesaService {
  constructor() {
    this.baseUrl = process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token
   * Caches token until expiry
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );

      this.token = response.data.access_token;
      // Token expires in 1 hour, refresh 5 minutes early
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);
      
      return this.token;
    } catch (error) {
      console.error('M-PESA OAuth Error:', error.response?.data || error.message);
      throw new Error('Failed to get M-PESA access token');
    }
  }

  /**
   * Generate password and timestamp for STK Push
   */
  generateCredentials() {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);
    
    const password = Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
  }

  /**
   * Format phone number to 254 format
   */
  formatPhoneNumber(phone) {
    let formatted = phone.toString().trim();
    
    // Remove any spaces or special characters
    formatted = formatted.replace(/[\s\-\(\)]/g, '');
    
    // Handle different formats
    if (formatted.startsWith('+254')) {
      formatted = formatted.slice(1);
    } else if (formatted.startsWith('0')) {
      formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted;
    }
    
    return formatted;
  }

  /**
   * Initiate STK Push (Lipa Na M-PESA Online)
   */
  async stkPush({
    phoneNumber,
    amount,
    accountReference,
    transactionDesc = 'Package Purchase'
  }) {
    try {
      const token = await this.getAccessToken();
      const { password, timestamp } = this.generateCredentials();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference.slice(0, 12), // Max 12 chars
        TransactionDesc: transactionDesc.slice(0, 13) // Max 13 chars
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.ResponseCode === '0',
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage,
        raw: response.data
      };
    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errorMessage || 'Failed to initiate STK Push'
      );
    }
  }

  /**
   * Query STK Push transaction status
   */
  async queryTransaction(checkoutRequestId) {
    try {
      const token = await this.getAccessToken();
      const { password, timestamp } = this.generateCredentials();

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const resultCode = parseInt(response.data.ResultCode);
      
      return {
        success: resultCode === 0,
        resultCode,
        resultDesc: response.data.ResultDesc,
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        raw: response.data
      };
    } catch (error) {
      console.error('Query Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errorMessage || 'Failed to query transaction'
      );
    }
  }

  /**
   * Parse STK Push callback data
   */
  parseCallback(callbackData) {
    const callback = callbackData?.Body?.stkCallback;
    
    if (!callback) {
      return null;
    }

    const result = {
      merchantRequestId: callback.MerchantRequestID,
      checkoutRequestId: callback.CheckoutRequestID,
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
      success: callback.ResultCode === 0
    };

    // Parse metadata if successful
    if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
      const metadata = callback.CallbackMetadata.Item;
      
      for (const item of metadata) {
        switch (item.Name) {
          case 'MpesaReceiptNumber':
            result.receiptNumber = item.Value;
            break;
          case 'Amount':
            result.amount = item.Value;
            break;
          case 'TransactionDate':
            result.transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            result.phoneNumber = item.Value;
            break;
        }
      }
    }

    return result;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone) {
    const formatted = this.formatPhoneNumber(phone);
    // Kenyan number: 254XXXXXXXXX (12 digits total)
    return /^254[17]\d{8}$/.test(formatted);
  }
}

// Export singleton instance
module.exports = new MpesaService();
