import { CryptoService } from './crypto.service';

jest.mock('crypto', () => ({
  randomBytes: () => ({
    readUInt32LE: () => 99999999999
  })
}));

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    service = new CryptoService();
  });

  describe('getAuthCode', () => {
    it('should return a 6 letter authCode', async () => {
      expect(service.getAuthCode()).toEqual('999999');
    });
  });
});
