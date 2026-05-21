type Factory<T> = () => T | Promise<T>;

export const initLazy = <TMap extends Record<string, any>>() => {
  const cache = new Map<keyof TMap, Promise<any>>();
  const factories = new Map<keyof TMap, Factory<any>>();

  const lazy = new Proxy({} as { [K in keyof TMap]: Promise<TMap[K]> }, {
    get(_, key) {
      if (typeof key !== "string") {
        throw new Error(`lazy key must be a string`);
      }

      if (!factories.has(key)) {
        throw new Error(`lazy '${key}' is not defined`);
      }

      if (!cache.has(key)) {
        const factory = factories.get(key)!;
        cache.set(key, Promise.resolve(factory()));
      }

      return cache.get(key)!;
    },
  });

  const define = (key: keyof TMap, factory: Factory<any>) => {
    factories.set(key, factory);
  };

  const resolve = async <K extends keyof TMap>(
    keys: K[],
  ): Promise<Pick<TMap, K>> => {
    const entries = await Promise.all(
      keys.map(async (k) => [k, await lazy[k]]),
    );

    return Object.fromEntries(entries);
  };

  const clear = () => cache.clear();

  return { lazy, define, resolve, clear };
};
