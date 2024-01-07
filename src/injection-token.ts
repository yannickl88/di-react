type Options<T> = {
  factory?: () => T;
  value?: T;
} & object;

export class InjectionToken<T> {
  constructor(
    public readonly name: string,
    public readonly options: Options<T> = {},
  ) {}
}
