import { ConnectionStatus } from '@safe-messenger/api-interfaces';
import { SerialisedJSON } from '@wireapp/proteus/dist/keys/PreKeyBundle';

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  initiator?: boolean;
}

export interface Contact {
  id: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  keyBundle: SerialisedJSON;
  target: User;
  initiator: User;
}
