import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectionKeys } from '@safe-messenger/api-interfaces';
import { CryptoboxCRUDStore } from '@wireapp/cryptobox/dist/commonjs/store';
import {
  IdentityKeyPair,
  PreKey,
  PreKeyBundle
} from '@wireapp/proteus/dist/keys';
import { SerialisedJSON } from '@wireapp/proteus/dist/keys/PreKeyBundle';
import { Envelope } from '@wireapp/proteus/dist/message';
import { Session } from '@wireapp/proteus/dist/session';
import { WebStorageEngine } from '@wireapp/store-engine-web-storage/dist/WebStorageEngine';

import * as sodium from 'libsodium-wrappers-sumo';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  constructor(private readonly httpClient: HttpClient) {}

  private getStore(targetEmail: string): Promise<CryptoboxCRUDStore> {
    const engine = new WebStorageEngine();

    return engine.init(`store-${targetEmail}`).then(() => {
      return new CryptoboxCRUDStore(engine);
    });
  }

  private async getNewIdentity(targetEmail: string): Promise<IdentityKeyPair> {
    const store = await this.getStore(targetEmail);
    await store.delete_all();
    const newIdentity = await IdentityKeyPair.new();

    return store.save_identity(newIdentity);
  }

  private async getIdentity(targetEmail: string): Promise<IdentityKeyPair> {
    const store = await this.getStore(targetEmail);

    const identity = await store.load_identity();

    return identity || this.getNewIdentity(targetEmail);
  }

  private async getNewPreKeys(targetEmail: string): Promise<PreKey[]> {
    const store = await this.getStore(targetEmail);
    const localPrekeys = (await store.load_prekeys()) || [];

    const newPreKeys = await PreKey.generate_prekeys(localPrekeys.length, 1);

    return store.save_prekeys(newPreKeys);
  }

  public async preparePreKeyBundle(
    targetEmail: string
  ): Promise<SerialisedJSON> {
    const store = await this.getStore(targetEmail);
    const identity = await this.getIdentity(targetEmail);
    const preKey = await this.getNewPreKeys(targetEmail);

    const keyBundle = new PreKeyBundle(identity.public_key, preKey[0]);

    return keyBundle.serialised_json();
  }

  public async initializeSessionFromPreKey(
    targetEmail: string,
    keyBundle: SerialisedJSON,
    sessionId?: string
  ): Promise<string> {
    const store = await this.getStore(targetEmail);
    const identity = await this.getIdentity(targetEmail);

    const base64KeyBundle = sodium.from_base64(
      keyBundle.key,
      sodium.base64_variants.ORIGINAL
    );
    const keyBundleArrayBuffer = base64KeyBundle.buffer;
    const deserialisedKeyBundle = PreKeyBundle.deserialise(
      keyBundleArrayBuffer
    );

    const newSession = await Session.init_from_prekey(
      identity,
      deserialisedKeyBundle
    );

    const newSessionId = sessionId || `0`;
    await store.create_session(newSessionId, newSession).catch(() => {});

    const encryptedHandshake: Envelope = await newSession.encrypt(newSessionId);

    return JSON.stringify({
      message: new Uint8Array(encryptedHandshake.serialise()).toString()
    });
  }

  public async initializeSessionFromHandshake(
    targetEmail: string,
    handshake: string
  ): Promise<Session> {
    const store = await this.getStore(targetEmail);
    const identity = await this.getIdentity(targetEmail);

    const deserializedTestObj: { message: string } = JSON.parse(handshake);
    const deserializedBuffer: number[] = deserializedTestObj.message
      .split(',')
      .map(num => Number.parseInt(num, 10));
    const newBuffer = Uint8Array.from(deserializedBuffer);

    const deserialisedMessage = Envelope.deserialise(newBuffer.buffer);

    const [
      session,
      decryptedMessageWithSessionId
    ] = await Session.init_from_message(identity, store, deserialisedMessage);

    const savedSession = await store.create_session(
      sodium.to_string(decryptedMessageWithSessionId),
      session
    );

    return savedSession;
  }

  public async encryptMessage(
    targetEmail: string,
    message: string,
    sessionId: string = '0'
  ): Promise<string> {
    const store = await this.getStore(targetEmail);
    const identity = await this.getIdentity(targetEmail);
    const session = await store.read_session(identity, sessionId);

    const encryptedMessage = await session.encrypt(message);

    await store.update_session(sessionId, session);

    return JSON.stringify({
      message: new Uint8Array(encryptedMessage.serialise()).toString()
    });
  }

  public async decryptMessage(
    targetEmail: string,
    sessionId: string,
    content: string
  ): Promise<string> {
    const store = await this.getStore(targetEmail);
    const identity = await this.getIdentity(targetEmail);
    const session = await store.read_session(identity, sessionId);

    const deserializedTestObj: { message: string } = JSON.parse(content);
    const deserializedBuffer: number[] = deserializedTestObj.message
      .split(',')
      .map(num => Number.parseInt(num, 10));
    const newBuffer = Uint8Array.from(deserializedBuffer);

    const deserialisedMessage = Envelope.deserialise(newBuffer.buffer);

    const decryptedMessage = await session.decrypt(store, deserialisedMessage);

    await store.update_session(sessionId, session);

    return sodium.to_string(decryptedMessage);
  }

  public getConnectionKeys(partner: string): Promise<ConnectionKeys> {
    return this.httpClient
      .get<ConnectionKeys>('/api/contacts/key', { params: { partner } })
      .toPromise();
  }

  public async getSession(
    targetEmail: string,
    sessionId?: string
  ): Promise<Session> {
    const store = await this.getStore(targetEmail);
    const identity = await this.getIdentity(targetEmail);

    const session = await store.read_session(identity, sessionId);

    return session;
  }
}
