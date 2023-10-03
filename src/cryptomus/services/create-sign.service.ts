import crypto from 'crypto';

export const createSignService = (payload: string): string => {
  const sign = crypto
    .createHash('md5')
    .update(
      Buffer.from(payload).toString('base64') + process.env.CRYPTOMUS_API_KEY,
    )
    .digest('hex');
  return sign;
};
