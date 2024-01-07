import { ConstructorType, RegistryToken } from "./types";
import { ServiceNotFoundException } from "./exceptions";

interface ServiceDefinition<T> {
  id: RegistryToken<T>;
  constructor: ConstructorType<T>;
  arguments: RegistryToken<any>[];
}

class ServiceArguments<T> {
  private handlers: RegistryToken<unknown>[] = [];

  public constructor(private target: ConstructorType<T>) {}

  public set(index: number, token: RegistryToken<unknown>): void {
    this.handlers[index] = token;
  }

  public resolve(): RegistryToken<any>[] {
    const paramTypes: unknown[] =
      Reflect.getMetadata("design:paramtypes", this.target) || [];

    return paramTypes.map((t, i) => this.handlers[i] ?? t);
  }
}

/**
 * @internal
 */
export class Registry {
  public static readonly defaultRegistry = new Registry();

  private serviceDefinitions = new Map<
    RegistryToken<unknown>,
    ServiceDefinition<unknown>
  >();
  private serviceArguments = new Map<
    ConstructorType<unknown>,
    ServiceArguments<unknown>
  >();

  public registerArgument<T>(
    target: ConstructorType<T>,
    index: number,
    token: RegistryToken<unknown>,
  ): void {
    let serviceArguments = this.serviceArguments.get(target);

    if (!serviceArguments) {
      serviceArguments = new ServiceArguments(target);
      this.serviceArguments.set(target, serviceArguments);
    }

    serviceArguments.set(index, token);
  }

  public registerService<T>(token: ConstructorType<T>): void {
    const serviceArguments =
      this.serviceArguments.get(token) ?? new ServiceArguments(token);

    this.serviceDefinitions.set(token, {
      id: token,
      constructor: token,
      arguments: serviceArguments.resolve(),
    });

    // We can clean up the arguments, as the definition has now been registered.
    this.serviceArguments.delete(token);
  }

  public getDefinition<T>(token: ConstructorType<T>): ServiceDefinition<T> {
    const definition = this.serviceDefinitions.get(token);

    if (!definition) {
      throw new ServiceNotFoundException(token);
    }

    return definition as ServiceDefinition<T>;
  }
}
