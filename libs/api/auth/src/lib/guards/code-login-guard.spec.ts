import { Test, TestingModule } from '@nestjs/testing';

import { CodeLoginGuard } from './code-login-guard';

describe('CodeLoginGuard', () => {
  let guard: CodeLoginGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeLoginGuard]
    }).compile();

    guard = module.get<CodeLoginGuard>(CodeLoginGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
