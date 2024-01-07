import {
  FactoryDependency,
  ImplementationDependency,
  InterfaceDependency,
  Simple,
  testRegistry,
  TransientDependency,
  ValueDependency,
} from "./__fixtures__/services";
import { Container } from "./container";
import { Injectable } from "./injectable";
import { InjectionToken } from "./injection-token";
import { Inject } from "./inject";

@Injectable({ registry: testRegistry })
class UnknownDependency {
  constructor(public arg1: string) {}
}

const ERROR_TOKEN = new InjectionToken("ERROR_TOKEN", {
  factory: () => {
    throw new Error("FOOBAR");
  },
});

@Injectable({ registry: testRegistry })
class BrokenDependency {
  constructor(
    @Inject(ERROR_TOKEN, { registry: testRegistry }) public arg1: string,
  ) {}
}

describe("Constainer", function () {
  let container: Container;

  beforeEach(function () {
    container = new Container(testRegistry);
  });

  it("should initialize services from the registry", function () {
    const instanceSimple = container.get(Simple);
    const instanceValueDependency = container.get(ValueDependency);
    const instanceTransientDependency = container.get(TransientDependency);
    const instanceInterfaceDependency = container.get(InterfaceDependency);
    const instanceImplementationDependency = container.get(
      ImplementationDependency,
    );
    const instanceFactoryDependency = container.get(FactoryDependency);

    expect(instanceSimple).toBeInstanceOf(Simple);

    expect(instanceValueDependency).toBeInstanceOf(ValueDependency);
    expect(instanceValueDependency.arg1).toBe(instanceSimple);
    expect(instanceValueDependency.arg2).toBe("FOOBAR");

    expect(instanceTransientDependency).toBeInstanceOf(TransientDependency);
    expect(instanceTransientDependency.arg1).toBe(instanceSimple);
    expect(instanceTransientDependency.arg2).toBe(instanceValueDependency);

    expect(instanceInterfaceDependency).toBeInstanceOf(InterfaceDependency);
    expect(instanceInterfaceDependency.arg1).toBe(
      instanceImplementationDependency,
    );

    expect(instanceFactoryDependency).toBeInstanceOf(FactoryDependency);
    expect(instanceFactoryDependency.arg1).toBe("FOOBAR");
  });

  it("should return the same instance when service is requested multiple times", function () {
    const instanceSimple = container.get(Simple);

    expect(instanceSimple).toBe(container.get(Simple));
  });

  it("should throw an error a token cannot produce a value", function () {
    expect(container.get(new InjectionToken("foo", { value: "foo" }))).toBe(
      "foo",
    );
    expect(
      container.get(new InjectionToken("foo", { factory: () => "foo" })),
    ).toBe("foo");
    expect(
      container.get(new InjectionToken("foo", { value: undefined })),
    ).toBeUndefined();
    expect(
      container.get(new InjectionToken("foo", { factory: () => undefined })),
    ).toBeUndefined();
    expect(() => container.get(new InjectionToken("foo", {}))).toThrow(
      "Could not create value from token foo, did you configure a value or factory?",
    );
  });

  it("should throw an error when a service and a dependency that cannot be initialized", function () {
    expect(() => container.get(UnknownDependency)).toThrow(
      "Argument 0 of type String was not found for service UnknownDependency, did you register it with @Injectable() or add an @Inject()?",
    );
  });

  it("should not silence exceptions thrown by dependencies", function () {
    expect(() => container.get(BrokenDependency)).toThrow("FOOBAR");
  });
});
