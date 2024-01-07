import { ServiceNotFoundException } from "./exceptions";
import {
  ImplementationDependency,
  InterfaceDependency,
  Simple,
  testRegistry,
  TransientDependency,
  VALUE_TOKEN,
  ValueDependency,
} from "./__fixtures__/services";

class Undecorated {}

describe("Registry", function () {
  it("should have service definitions of registered services", function () {
    expect(testRegistry.getDefinition(Simple)).toEqual({
      id: Simple,
      constructor: Simple,
      arguments: [],
    });
    expect(testRegistry.getDefinition(ValueDependency)).toEqual({
      id: ValueDependency,
      constructor: ValueDependency,
      arguments: [Simple, VALUE_TOKEN],
    });
    expect(testRegistry.getDefinition(TransientDependency)).toEqual({
      id: TransientDependency,
      constructor: TransientDependency,
      arguments: [Simple, ValueDependency],
    });
    expect(testRegistry.getDefinition(InterfaceDependency)).toEqual({
      id: InterfaceDependency,
      constructor: InterfaceDependency,
      arguments: [ImplementationDependency],
    });
    expect(() => testRegistry.getDefinition(Undecorated)).toThrow(
      new ServiceNotFoundException(Undecorated),
    );
  });
});
