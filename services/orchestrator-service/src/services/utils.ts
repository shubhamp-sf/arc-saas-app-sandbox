import {AnyObject} from '@loopback/repository';
import crypto from 'crypto';

export function verifySignature(payload: AnyObject, signature: string) {
  const payloadString = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(payloadString).digest();

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(hash);

  if (!process.env.PUBLIC_KEY) {
    throw new Error('PUBLIC_KEY not found');
  }
  const publicKey = `
-----BEGIN PUBLIC KEY-----
${process.env.PUBLIC_KEY}
-----END PUBLIC KEY-----
  `;

  return verifier.verify(publicKey, signature, 'base64');
}

export function signPayload(payload: AnyObject) {
  const payloadString = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(payloadString).digest();

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(hash);

  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found');
  }

  const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
${process.env.PRIVATE_KEY}
-----END RSA PRIVATE KEY-----
  `;

  return signer.sign(privateKey, 'base64');
}
