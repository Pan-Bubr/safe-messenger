import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContactsService } from './services/contacts.service';

@NgModule({
  imports: [CommonModule],
  providers: [ContactsService]
})
export class ClientCommonModule {}
