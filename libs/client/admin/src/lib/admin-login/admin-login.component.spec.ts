import { RouterTestingModule } from '@angular/router/testing';
import { ClientAdminModule } from '@safe-messenger/client/admin';

import { of, throwError } from 'rxjs';
import { Shallow } from 'shallow-render';

import { AdminAuthService } from '../services/admin-auth.service';
import { AdminLoginComponent } from './admin-login.component';

describe('LoginContainerComponent', () => {
  let shallow: Shallow<AdminLoginComponent>;

  beforeEach(() => {
    shallow = new Shallow(AdminLoginComponent, ClientAdminModule).import(
      RouterTestingModule
    ).provideMock({
      provide: AdminAuthService,
      useValue: {
        login: jest.fn(() => of(''))
      }
    });
  });

  it('should match snapshot', async () => {
    const { fixture } = await shallow.render();

    expect(fixture).toMatchSnapshot();
  });

  it('login() should send login request', async () => {
    const { instance, get } = await shallow.render();

    instance.login({
      login: 'test',
      password: 'testPassword'
    });

    expect(get(AdminAuthService).login).toBeCalled();
  });

  it('login() should send login request', async () => {
    const { instance, get } = await shallow.render();

    (get(AdminAuthService).login as jest.Mock).mockImplementationOnce(throwError);

    instance.login({
      login: 'test',
      password: 'testPassword'
    });

    expect(get(AdminAuthService).login).toBeCalled();
  });
});
