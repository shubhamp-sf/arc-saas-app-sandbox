import {AnyObject} from '@loopback/repository';
import crypto from 'crypto';

/**
 * Returns the numeric values of an enum.
 * @param enumType - The enum to get the numeric values from.
 * @returns The numeric values of the enum.
 */
export function numericEnumValues(enumType: Object) {
  return Object.keys(enumType)
    .map(key => Number(key))
    .filter(value => !isNaN(value));
}

// Asymmetric encryption functions
export function verifySignature(payload: AnyObject, signature: string) {
  const publicKey = process.env.PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('PUBLIC_KEY not set.');
  }

  const formattedPublicKey = `
-----BEGIN PUBLIC KEY-----
${publicKey}
-----END PUBLIC KEY-----
`;

  const payloadString = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(payloadString).digest();

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(hash);

  return verifier.verify(formattedPublicKey, signature, 'base64');
}

export function signPayload(payload: AnyObject) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set.');
  }

  const formattedPrivateKey = `
-----BEGIN RSA PRIVATE KEY-----
${privateKey}
-----END RSA PRIVATE KEY-----
`;

  const payloadString = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(payloadString).digest();

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(hash);

  return signer.sign(formattedPrivateKey, 'base64');
}
