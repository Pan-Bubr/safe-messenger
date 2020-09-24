import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactsService } from '@safe-messenger/client/common';
import { AuthService } from '@safe-messenger/client/login';

import { of } from 'rxjs';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [HomePageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {}
        },
        {
          provide: ContactsService,
          useValue: {
            getContacts: jest.fn(() => of([])),
            getInvitations: jest.fn(() => of([])),
            invitationsReceived$: of([]),
            invitationsSent$: of([]),
            contacts$: of([])
          }
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: jest.fn()
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
