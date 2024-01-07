import { ConstructorType, RegistryToken } from "./types";
import { Registry } from "./registry";

type Options = {
  registry?: Registry;
};

export function Inject<T>(
  token: RegistryToken<T>,
  options: Options = {},
): ParameterDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) {
    (options.registry ?? Registry.defaultRegistry).registerArgument(
      target as ConstructorType<unknown>,
      parameterIndex,
      token,
    );
  };
}
