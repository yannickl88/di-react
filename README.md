# Dependency Injection for React

`di-react` is a [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) tool for helping global state management using services. With it you can better test and manage global state in your React Applications in TypeScript.
> Note: `@yannickl88/di-react` specifically targets TypeScript due to its decorator and metadata support. While not impossible to get working using JavaScript, this is not recommended, as most features will not be available.

## Installation
NPM
```
npm install @yannickl88/di-react reflect-metadata
```
Yarn
```
yarn add @yannickl88/di-react reflect-metadata
```

Import the `reflect-metadata` package at the first line of your application. This allows the service container to read the constructor arguments for any of the services.
```typescript
// index.tsx
import 'reflect-metadata';

// And then the rest of your application
import * as React from "react";
// etc.
```

Finally, since `di-react` is using `reflect-metadata`, we need to ensure that the typescript compiler options are enabled in your `tsconfig.json`.
```json
// tsconfig.json
{
    "compilerOptions": {
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true
    }
}
```
Now you are ready to start using Services in your application.

## Basic Usage
Services are typically shared in your application so everything has the same instance. Traditionally, this can be done by exporting a constant as in the example below. However, this can cause problems when trying to test components and them calling actual API endpoints, instead of mocked versions.

Using the Dependency Injection pattern, this can more easily be solved. With this tool, you can annotate services with the `@Injectable()` decorator, and then use the `useInject()` hook to retrieve them.

```typescript
@Injectable()
export class UserApi {

    public getInformation(): Promise<UserInfo> {
        //...
    }
}
```

You can then start using that instance in your code somewhere.

```typescript
export function MyComponent() {
    const userApi = useInject(UserApi);

    // ...
}
```

Then in your tests, you can mock out the container with our own, by passing using the `ContainerContext` and using a provider for your mocked container. Override instances in the container by calling the `Container.set()` method. It will use these instances instead of initializing the real service dependency. (This even works for transient dependencies.)

```typescript jsx
describe("MyComponent", function () {
    it("should ...", function () {
        const mockContainer = new Container();
        mockContainer.set(userApi, {} as UserApi);
        
        render(() => <MyComponent />, {
            wrapper: (props) => (
                <ContainerContext.Provider value={mockContainer}>
                    {props.children}
                </ContainerContext.Provider>
            ),
        });

        // ...
    });
});
```

### Transient dependencies
The service container will automatically create and pass any constructor arguments when initializing a service (i.e., transient dependencies). This requires for any dependency to be something the container needs to be aware of. In most cases, this means that those classes also need to be decorated with the `@Injectable()`.

```typescript
@Injectable()
export class Connection {
    // ...
}

@Injectable()
export class UserApi {
    constructor(private connection: Connection) {
    }
}
```

This will also create an instance in the service container for the `Connection` too when requesting the `UserApi`.
> Note: Services are only created once, even if they are dependencies of other services. So in the above example, any service dependent on the `Connection` will get the same instance.

### Interface dependencies
In some cases you might prefer to typehint an interface, instead of a class, to then later get an implementation of that interface at service resolution. This can be done by hinting the service to inject using the `@Inject()` decorator. 

```typescript
export interface ConnectionInterface {
    // ...
}

@Injectable()
export class FetchConnection implements ConnectionInterface {
    // ...
}

@Injectable()
export class UserApi {
    constructor(@Inject(FetchConnection) private connection: ConnectionInterface) {
    }
}
```

This allows for more clean tests, where you can test the service with another implementation of the `ConnectionInterface`, while in your application you get the `FetchConnection`.

### Value dependencies
In the cases, you might need dependencies that are not services, but values, this can be done using `InjectionToken` values. These let you specify the value or factory how to be created. You can then use the `@Inject()` decorator on the constructor arguments to let the container know to use the injection token instead of a service reference.

Creating a token with a value.
```typescript
const URL_TOKEN = new InjectionToken("URL_TOKEN", { value: "https://example.com/" });
```
Creating a token with a factory.
```typescript
const URL_TOKEN = new InjectionToken("URL_TOKEN", { factory: () => "https://example.com/" });
```

This can then be used in combination with the `@Inject()`.
```typescript
@Injectable()
export class Connection {
    constructor(@Inject(URL_TOKEN) private url: string) {
    }

    // ...
}

@Injectable()
export class UserApi {
    constructor(private connection: Connection) {
    }
}
```

## Acknowledgements
* This library takes a lot of inspiration from the Angular, which also contains a Dependency Injection tool.  

## FAQ
### Why is there no way to inspect the registered service definitions?
The way decorators work in TypeScript, is that they are being called when the class is loaded into memory. Typically, this is the moment the file is imported by something. This means that the service is only aware of any classes that are imported up until that moment. However, more can come in the future. Either due to more code being hit and more imports to services are being done, or by lazy loaded chunks adding more service definitions. 

This means that any introspection would have very unpredictable behaviour, since services can be registered at any moment.

An upside to this, is that is allows services to be tree-shaken and put into lazy loaded chunks. This will improve the performance of your application.

### Why should I use this library over any other DI one?
Library choice is always a choice, so feel free to select whatever you prefer and works best in your specific use-case. However, below are listed some popular other libraries and how they compare to this one.

#### [InversifyJS](https://github.com/inversify/InversifyJS)
InversionJs is well maintained, however, it requires explicit container configuration. This means that all services need to be registered manually, possibly creating less tree-shakeable services in the process. Moreover, it makes it harder to maintain lazy loading of chunks with services.

The upside of more explicit container configuration is that is allowing for more features, which this library will never support. One of them is Multi-injection, where you fetch all services which match a specific criteria. This only works if you know all services upfront.

#### [tsyringe](https://github.com/microsoft/tsyringe)
Tsyringe is somewhat maintained, allthrough progress has slowed down. The main difference is that it only support a single global container. This means it is hard to swap out for unit tests.

#### [typedi](https://github.com/typestack/typedi)
Typedi comes closes with respect to the current feature set. However, it seems to be [unmaintained](https://github.com/typestack/typedi/issues/1235).
