import midtransClient from 'midtrans-client';

export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export function validateSignature(notification) {
  return midtransClient.Core.validateNotificationSignature(
    notification,
    notification.signature_key,
    process.env.MIDTRANS_SERVER_KEY
  );
}
