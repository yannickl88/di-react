import { ConstructorType, RegistryToken } from "./types";
import { InjectionToken } from "./injection-token";

export class ServiceNotFoundException extends Error {
  constructor(token: RegistryToken<unknown>) {
    super(
      `Could not find service with token ${token.name}. Did you add an @Injectable()?`,
    );
  }
}

export class InvalidValueFromTokenException extends Error {
  constructor(token: InjectionToken<unknown>) {
    super(
      `Could not create value from token ${token.name}, did you configure a value or factory?`,
    );
  }
}

export class ArgumentNotFoundException extends Error {
  constructor(
    constructor: ConstructorType<unknown>,
    index: number,
    token: RegistryToken<unknown>,
  ) {
    super(
      `Argument ${index} of type ${token.name} was not found for service ${constructor.name}, did you register it with @Injectable() or add an @Inject()?`,
    );
  }
}
