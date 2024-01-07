import { InjectionToken } from "./injection-token";

export type ConstructorType<T> = new (...args: any[]) => T;

export type RegistryToken<T> = (ConstructorType<T> | InjectionToken<T>) & {
  name: string;
};
