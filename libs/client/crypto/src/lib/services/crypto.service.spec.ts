import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CryptoboxCRUDStore } from '@wireapp/cryptobox/dist/commonjs/store';
import { keys, session } from '@wireapp/proteus/dist';
import { WebStorageEngine } from '@wireapp/store-engine-web-storage/dist/WebStorageEngine';

import * as sodium from 'libsodium-wrappers-sumo';

import { CryptoService } from './crypto.service';

const createStore = async (
  prefix: string,
  prekeys: keys.PreKey[]
): Promise<CryptoboxCRUDStore> => {
  const engine = new WebStorageEngine();
  await engine.init(`${prefix}-store`);

  const store = new CryptoboxCRUDStore(engine);

  await store.save_prekeys(prekeys);

  return store;
};

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CryptoService]
    });
    service = TestBed.inject(CryptoService);

    const targetEmail = 'testEmail';
  });

  it('should be ok', async () => {
    const bobPreKeys = await keys.PreKey.generate_prekeys(0, 1);
    const bobStore = await createStore('bob', bobPreKeys);
    const bob = await keys.IdentityKeyPair.new();

    const alicePreKeys = await keys.PreKey.generate_prekeys(0, 1);
    const aliceStore = await createStore('alice', alicePreKeys);
    const alice = await keys.IdentityKeyPair.new();

    // Komputer Boba
    const bobPreKey = await bobStore.load_prekey(0);
    const bobPreKeyBundle = new keys.PreKeyBundle(bob.public_key, bobPreKey);

    // Komputer Alice
    const aliceToBob = await session.Session.init_from_prekey(
      alice,
      bobPreKeyBundle
    );

    await aliceStore.create_session('aliceToBob', aliceToBob);

    const plaintext = 'Hello Bob!';
    const preKeyMessage = await aliceToBob.encrypt(plaintext);

    const [bobToAlice, decrypted] = await session.Session.init_from_message(
      bob,
      bobStore,
      preKeyMessage
    );

    await bobStore.create_session('bobToAlice', bobToAlice);
    expect(sodium.to_string(decrypted)).toBe(plaintext);
    expect(bobToAlice).toBeDefined();
    const responsePlaintext = 'Hello Alice!';
    const preKeyResponseMessage = await bobToAlice.encrypt(responsePlaintext);
    const aliceSession = await aliceStore.read_session(alice, 'aliceToBob');
    const newDecrypted = await aliceSession.decrypt(
      aliceStore,
      preKeyResponseMessage
    );
    expect(sodium.to_string(newDecrypted)).toBe(responsePlaintext);

    //Komputer Boba
    const secondMessaceEncrypted = await bobToAlice.encrypt('Second');

    // Komputer Alice
    const secondMessageDecrypted = await aliceSession.decrypt(
      aliceStore,
      secondMessaceEncrypted
    );
    expect(sodium.to_string(secondMessageDecrypted)).toBe('Second');
    const thirdMessageEncrypted = await aliceToBob.encrypt('Third');
    const fourthMessafeEncrypted = await aliceToBob.encrypt('Fourth');

    //Komputer Boba

    const fourth = await bobToAlice.decrypt(bobStore, fourthMessafeEncrypted);
    expect(sodium.to_string(fourth)).toBe('Fourth');

    const thirdMessageDecrypted = await bobToAlice.decrypt(
      bobStore,
      thirdMessageEncrypted
    );
    expect(sodium.to_string(thirdMessageDecrypted)).toBe('Third');
  });

  describe('getStore()', () => {
    it('should get WebStorage store for a given targetEmail', async () => {});
  });

  it('should publish initial keys', async () => {
    //Bob publishes a set of elliptic curve public keys to the server, containing:
    //
    // Bob's identity key IKB
    // Bob's signed prekey SPKB
    // Bob's prekey signature Sig(IKB, Encode(SPKB))
    // A set of Bob's one-time prekeys (OPKB1, OPKB2, OPKB3, ...)
    // Bob only needs to upload his identity key to the server once.
    // However, Bob may upload new one-time prekeys at other times
    // (e.g. when the server informs Bob that the server's store of one-time prekeys is getting low).
    //
    // Bob will also upload a new signed prekey and prekey signature at some interva
    // (e.g. once a week, or once a month).
    // The new signed prekey and prekey signature will replace the previous values.
    //
    // After uploading a new signed prekey,
    // Bob may keep the private key corresponding to the previous signed prekey around for some period of time,
    // to handle messages using it that have been delayed in transit.
    // Eventually, Bob should delete this private key for forward secrecy
    // (one-time prekey private keys will be deleted as Bob receives messages using them; see Section 3.4).
  });

  it('should create a session from initial message', async () => {
    //To perform an X3DH key agreement with Bob,
    // Alice contacts the server and fetches a "prekey bundle" containing the following values:
    //
    // Bob's identity key IKB
    // Bob's signed prekey SPKB
    // Bob's prekey signature Sig(IKB, Encode(SPKB))
    // (Optionally) Bob's one-time prekey OPKB
    // The server should provide one of Bob's one-time prekeys if one exists,
    // and then delete it.
    // If all of Bob's one-time prekeys on the server have been deleted, the bundle will not contain a one-time prekey.
    //
    // Alice verifies the prekey signature and aborts the protocol if verification fails.
    // Alice then generates an ephemeral key pair with public key EKA.
    //
    // If the bundle does not contain a one-time prekey, she calculates:
    //
    //     DH1 = DH(IKA, SPKB)
    //     DH2 = DH(EKA, IKB)
    //     DH3 = DH(EKA, SPKB)
    //     SK = KDF(DH1 || DH2 || DH3)
    //
    // If the bundle does contain a one-time prekey, the calculation is modified to include an additional DH:
    //
    //     DH4 = DH(EKA, OPKB)
    //     SK = KDF(DH1 || DH2 || DH3 || DH4)
    //
    // The following diagram shows the DH calculations between keys.
    // Note that DH1 and DH2 provide mutual authentication, while DH3 and DH4 provide forward secrecy.
    //
    // DH1...DH4
    // DH1...DH4
    //
    // After calculating SK, Alice deletes her ephemeral private key and the DH outputs.
    //
    // Alice then calculates an "associated data" byte sequence AD that contains identity information for both parties:
    //
    //     AD = Encode(IKA) || Encode(IKB)
    //
    // Alice may optionally append additional information to AD,
    // such as Alice and Bob's usernames, certificates, or other identifying information.
    //
    // Alice then sends Bob an initial message containing:
    //
    // Alice's identity key IKA
    // Alice's ephemeral key EKA
    // Identifiers stating which of Bob's prekeys Alice used
    // An initial ciphertext encrypted with some AEAD encryption scheme [4] using AD as associated data
    // and using an encryption key which is either SK or the output from some cryptographic PRF keyed by SK.
    // The initial ciphertext is typically the first message in some post-X3DH communication protocol.
    // In other words, this ciphertext typically has two roles,
    // serving as the first message within some post-X3DH protocol,
    // and as part of Alice's X3DH initial message.
    //
    // After sending this, Alice may continue using SK or keys derived from SK
    // within the post-X3DH protocol for communication with Bob,
    // subject to the security considerations in Section 4.
  });

  it('should decipher initial message', async () => {
    //Upon receiving Alice's initial message, Bob retrieves Alice's identity key and ephemeral key from the message.
    // Bob also loads his identity private key, and the private key(s)
    // corresponding to whichever signed prekey and one-time prekey (if any) Alice used.
    //
    // Using these keys, Bob repeats the DH and KDF calculations
    // from the previous section to derive SK, and then deletes the DH values.
    //
    // Bob then constructs the AD byte sequence using IKA and IKB, as described in the previous section.
    // Finally, Bob attempts to decrypt the initial ciphertext using SK and AD.
    // If the initial ciphertext fails to decrypt, then Bob aborts the protocol and deletes SK.
    //
    // If the initial ciphertext decrypts successfully the protocol is complete for Bob.
    // Bob deletes any one-time prekey private key that was used, for forward secrecy.
    // Bob may then continue using SK or keys derived from SK within the
    // post-X3DH protocol for communication with Alice,
    // subject to the security considerations in Section 4.
  });
});
