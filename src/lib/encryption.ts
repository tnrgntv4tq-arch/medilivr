import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encryptBuffer(data: Buffer): { encrypted: Buffer; iv: string; key: string; tag: string } {
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([encrypted, tag]),
    iv: iv.toString('hex'),
    key: key.toString('hex'),
  };
}

export function decryptBuffer(encryptedData: Buffer, ivHex: string, keyHex: string): Buffer {
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = encryptedData.subarray(encryptedData.length - 16);
  const encrypted = encryptedData.subarray(0, encryptedData.length - 16);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || '';

export function encryptKey(dataKey: string): string {
  const masterKey = Buffer.from(MASTER_KEY.slice(0, 64), 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, masterKey, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(dataKey, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + tag.toString('hex');
}

export function decryptKey(encryptedKey: string): string {
  const masterKey = Buffer.from(MASTER_KEY.slice(0, 64), 'hex');
  const [ivHex, dataHex, tagHex] = encryptedKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, masterKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
