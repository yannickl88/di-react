import { Registry } from "./registry";
import { ConstructorType } from "./types";

type Options = {
  registry?: Registry;
};

export function Injectable<T>(options: Options = {}): ClassDecorator {
  return function (target) {
    (options.registry ?? Registry.defaultRegistry).registerService(
      target as unknown as ConstructorType<T>,
    );
  };
}
