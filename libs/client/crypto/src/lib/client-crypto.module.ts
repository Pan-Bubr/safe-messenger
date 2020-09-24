import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { CryptoService } from './services/crypto.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [CryptoService]
})
export class ClientCryptoModule {}
