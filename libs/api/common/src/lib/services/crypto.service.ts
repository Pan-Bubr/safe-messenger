import { Injectable } from '@nestjs/common';

import { randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  public getAuthCode(): string {
    return randomBytes(256)
      .readUInt32LE(0)
      .toString()
      .substr(0, 6);
  }
}
