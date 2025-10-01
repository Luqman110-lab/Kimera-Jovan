import { useState, useEffect } from 'react';

/**
 * NOTE: This file has been refactored to support the application's migration
 * from LocalStorage to IndexedDB. It now contains a `useLiveQuery` hook for Dexie.js.
 */

/**
 * A hook that subscribes to a Dexie.js live query and returns its results.
 * The component will re-render automatically when the query results change.
 * @param query A function that performs a Dexie.js query.
 * @param dependencies An array of dependencies that, when changed, will re-subscribe to the query.
 * @returns The result of the query, or undefined while the query is running for the first time.
 */
export function useLiveQuery<T>(
  query: () => Promise<T>,
  dependencies: any[] = []
): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    // Dexie is loaded from a CDN, so we access it from the window object.
    const dexie = (window as any).Dexie;
    if (!dexie) {
        console.error('Dexie is not available on the window object. Make sure it is loaded.');
        return;
    }

    const liveQuery = dexie.liveQuery(query);

    const subscription = liveQuery.subscribe({
      next: (result: T) => setData(result),
      error: (error: any) => console.error('useLiveQuery error:', error),
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return data;
}
