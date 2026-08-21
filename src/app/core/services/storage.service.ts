import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }


  // =========================================
  // GET
  // =========================================

  get<T>(key: string): T | null {

    if (!this.isBrowser) {
      return null;
    }

    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return null;
    }

    try {

      return JSON.parse(storedValue) as T;

    } catch (error) {

      console.error(
        `Unable to parse LocalStorage value for key: ${key}`,
        error
      );

      return null;
    }
  }


  // =========================================
  // SET
  // =========================================

  set<T>(key: string, value: T): void {

    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }


  // =========================================
  // REMOVE
  // =========================================

  remove(key: string): void {

    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(key);
  }


  // =========================================
  // CLEAR
  // =========================================

  clear(): void {

    if (!this.isBrowser) {
      return;
    }

    localStorage.clear();
  }

}