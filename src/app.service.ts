import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
// navigator.locks.request("net_db_sync", showLockProperties);
// navigator.locks.request("another_lock", { mode: "shared" }, showLockProperties);

// function showLockProperties(lock) {
//   console.log(`The lock name is: ${lock.name}`);
//   console.log(`The lock mode is: ${lock.mode}`);
// }
