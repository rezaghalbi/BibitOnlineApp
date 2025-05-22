const midtransClient = require('midtrans-client');

const midtrans = {
  createTransaction: async (orderDetails) => {
    try {
      const snap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_ENV === 'sandbox',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      });

      return await snap.createTransaction(orderDetails);
    } catch (error) {
      throw new Error(`Midtrans error: ${error.message}`);
    }
  },
};

module.exports = midtrans;
