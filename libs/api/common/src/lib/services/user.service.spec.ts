import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserEntity } from '../entities/user-entity';
import { UserService } from './user.service';

const MockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: MockUserRepository
        }
      ]
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findOne', () => {
    it('should find a user with a given parameters', async () => {
      const mockUser = {
        id: 'mockuuid',
        email: 'email',
        displayName: 'Display Name'
      };
      const mockQuery = { email: 'mockMail' };

      MockUserRepository.findOne.mockImplementationOnce(() => mockUser);
      const user = await service.findOne(mockQuery.email);

      expect(user).toEqual(mockUser);
      expect(MockUserRepository.findOne).toBeCalledWith(mockQuery);
    });
  });


  describe('findEmails', () => {
    it('should find emails of users', async () => {
      MockUserRepository.find.mockImplementationOnce(() => Promise.resolve([{email: 'email'}]));
      const users = await service.findEmails(0);

      expect(users).toEqual(['email']);
    });
  });

  describe('save', () => {
    it('should save a user to database', async () => {
      const mockUser = {
        id: 'mockuuid',
        email: 'email',
        displayName: 'Display Name'
      };
      const mockEmail = 'mockMail';
      const mockDisplayName = 'Display Name';

      MockUserRepository.save.mockImplementationOnce(() => mockUser);
      const user = await service.save(mockEmail, mockDisplayName);

      expect(user).toEqual(mockUser);
      expect(MockUserRepository.save).toBeCalledWith({
        email: mockEmail,
        displayName: mockDisplayName
      });
    });
  });

  describe('remove', () => {
    it('should remove a user from database', async () => {
      const mockEmail = 'mockEmail';
      MockUserRepository.delete.mockImplementationOnce(() => {});
      await service.delete(mockEmail);

      expect(MockUserRepository.delete).toBeCalledWith({ email: mockEmail });
    });
  });
});
