import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Store } from 'tauri-plugin-store-api';

@Injectable()
export class StorageService {
  async saveToStore<T>(file: string, key: string, data: T) {
    const store = new Store(file);

    await store.set(key, { value: data });
    await store.save();
  }

  getFromStore<T>(file: string, key: string): Observable<{ value: T } | null> {
    const store = new Store(file);

    return from(store.get<{ value: T }>(key));
  }
}
