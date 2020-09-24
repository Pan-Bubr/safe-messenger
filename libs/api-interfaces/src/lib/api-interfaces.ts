import { SerialisedJSON } from '@wireapp/proteus/dist/keys/PreKeyBundle';

import { User } from './client-interfaces';

export interface JwtSignature {
  email: string;
}

export interface AdminSignature {
  admin: boolean;
}

export interface ApiStatus {
  success: boolean;
}

export interface ApiTokenMessage extends ApiStatus {
  token: string;
  expiresIn: number;
}

export interface ConnectionList {
  initiated: User[];
  received: User[];
}

export interface Invitations {
  received: string[];
  sent: string[];
}

export interface ConnectionKeys {
  keyBundle: SerialisedJSON;
  handshake: string;
}

export enum ConnectionStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
  BLOCKED
}

export interface RawMessage {
  id?: string;
  senderEmail?: string;
  sentAt: Date;
  recipientEmail: string;
  content: string;
  sessionId: string;
}

export interface EncryptedMessage {
  id?: string;
  senderEmail?: string;
  sentAt: Date;
  recipientEmail: string;
  content: string;
  sessionId: string;
}

export interface ErrorMessage extends RawMessage {
  error: Error;
}
