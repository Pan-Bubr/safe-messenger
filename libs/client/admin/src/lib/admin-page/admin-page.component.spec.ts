import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientAdminModule } from '@safe-messenger/client/admin';

import { of } from 'rxjs';
import { Shallow } from 'shallow-render';

import { AdminAuthService } from '../services/admin-auth.service';
import { AdminService } from '../services/admin.service';
import { AdminPageComponent } from './admin-page.component';

describe('LoginContainerComponent', () => {
  let shallow: Shallow<AdminPageComponent>;

  beforeEach(() => {
    shallow = new Shallow(AdminPageComponent, ClientAdminModule)
      .import(HttpClientTestingModule)
      .provideMock(
        {
          provide: AdminService,
          useValue: {
            userList: jest.fn(() => of(['email'])),
            addUser: jest.fn(() => of('')),
            remove: jest.fn(() => of(''))
          }
        },
        {
          provide: AdminAuthService,
          useValue: {
            logout: jest.fn()
          }
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: jest.fn()
          }
        }
      );
  });

  it('should match snapshot', async () => {
    const { fixture } = await shallow.render();

    expect(fixture).toMatchSnapshot();
  });

  it('refresh() should request userList', async () => {
    const { instance, get } = await shallow.render();

    instance.refresh();

    expect(get(AdminService).userList).toBeCalled();
  });

  it('addUser() should request userList', async () => {
    const { instance, get } = await shallow.render();

    instance.addUser({
      email: 'mockEmail',
      displayName: 'mockDisplayName'
    });

    expect(get(AdminService).addUser).toBeCalled();
  });

  it('delete() should request userList', async () => {
    const { instance, get } = await shallow.render();

    instance.delete('mockEmail');

    expect(get(AdminService).remove).toBeCalled();
  });

  it('logout() should request userList', async () => {
    const { instance, get } = await shallow.render();

    await instance.logout();

    expect(get(AdminAuthService).logout).toBeCalled();
  });
});
