import { ConstructorType, RegistryToken } from "./types";
import { Registry } from "./registry";
import { InjectionToken } from "./injection-token";
import {
  ArgumentNotFoundException,
  InvalidValueFromTokenException,
  ServiceNotFoundException,
} from "./exceptions";

export class Container {
  private registry: Registry;
  private instances = new Map<RegistryToken<unknown>, any>();

  constructor(registry?: Registry) {
    this.registry = registry ?? Registry.defaultRegistry;
  }

  public get<T>(token: RegistryToken<T>): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    return this.set(token, this.initialize(token));
  }

  public set<T>(token: RegistryToken<T>, instance: T): T {
    this.instances.set(token, instance);

    return instance;
  }

  private initialize<T>(token: RegistryToken<T>): T {
    if (token instanceof InjectionToken) {
      if ("value" in token.options) {
        return token.options.value!;
      }
      if ("factory" in token.options) {
        return token.options.factory!();
      }

      throw new InvalidValueFromTokenException(token);
    }

    const definition = this.registry.getDefinition(token as ConstructorType<T>);
    const constructorArguments = definition.arguments.map((t, i) => {
      try {
        return this.get(t);
      } catch (e) {
        if (e instanceof ServiceNotFoundException) {
          throw new ArgumentNotFoundException(token, i, t);
        }

        throw e;
      }
    });

    return new definition.constructor(...constructorArguments);
  }
}
