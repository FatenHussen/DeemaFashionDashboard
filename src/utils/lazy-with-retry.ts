import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const CHUNK_RELOAD_KEY = 'app-chunk-reload';

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('loading chunk') ||
    message.includes('loading css chunk') ||
    message.includes('importing a module script failed')
  );
}

export function reloadOnChunkLoadError(): boolean {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    return false;
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  window.location.reload();
  return true;
}

export function clearChunkReloadFlag(): void {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}

export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      if (isChunkLoadError(error) && reloadOnChunkLoadError()) {
        return new Promise(() => {});
      }

      throw error;
    }
  });
}
