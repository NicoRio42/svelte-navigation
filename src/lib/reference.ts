export function createReference<T>(value: T): Reference<T> {
  return {
    get: () => value,
    set: (newValue: T) => {
      value = newValue;
    },
  };
}

export type Reference<T> = {
  get: () => T;
  set: (newValue: T) => void;
};
