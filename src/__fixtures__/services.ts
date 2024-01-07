import { Registry } from "../registry";
import { InjectionToken } from "../injection-token";
import { Injectable } from "../injectable";
import { Inject } from "../inject";

export const testRegistry = new Registry();

export const VALUE_TOKEN = new InjectionToken("VALUE_TOKEN", {
  value: "FOOBAR",
});
export const FACTORY_TOKEN = new InjectionToken("VALUE_TOKEN", {
  factory: () => "FOOBAR",
});

export interface InterfaceArgument {
  name: string;
}

@Injectable({ registry: testRegistry })
export class ImplementationDependency implements InterfaceArgument {
  public readonly name = "FOOBAR";
}

@Injectable({ registry: testRegistry })
export class Simple {}

@Injectable({ registry: testRegistry })
export class ValueDependency {
  constructor(
    public arg1: Simple,
    @Inject(VALUE_TOKEN, { registry: testRegistry }) public arg2: string,
  ) {}
}

@Injectable({ registry: testRegistry })
export class TransientDependency {
  constructor(
    public arg1: Simple,
    public arg2: ValueDependency,
  ) {}
}

@Injectable({ registry: testRegistry })
export class InterfaceDependency {
  constructor(
    @Inject(ImplementationDependency, { registry: testRegistry })
    public arg1: InterfaceArgument,
  ) {}
}

@Injectable({ registry: testRegistry })
export class FactoryDependency {
  constructor(
    @Inject(FACTORY_TOKEN, { registry: testRegistry }) public arg1: string,
  ) {}
}
