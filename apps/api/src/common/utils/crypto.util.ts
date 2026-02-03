import * as crypto from 'crypto';

export function calculateHmac(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyMomoSignature(
  params: Record<string, unknown>,
  secret: string,
): boolean {
  const { signature, ...rest } = params;

  // Sắp xếp các key theo thứ tự alphabet và build query string
  const sortedKeys = Object.keys(rest).sort();
  const rawData = sortedKeys
    .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
    .join('&');

  const calculatedSignature = calculateHmac(rawData, secret);
  return calculatedSignature === signature;
}

export function verifyPayOSSignature(
  data: Record<string, unknown>,
  signature: string,
  checksumKey: string,
): boolean {
  // Logic verify cho PayOS (thường là sắp xếp key và hash)
  const sortedData = Object.keys(data)
    .sort()
    .reduce((obj: Record<string, unknown>, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  const rawData = Object.keys(sortedData)
    .map((key) => `${key}=${sortedData[key as keyof typeof sortedData]}`)
    .join('&');

  const calculatedSignature = calculateHmac(rawData, checksumKey);
  return calculatedSignature === signature;
}
