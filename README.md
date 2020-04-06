
This library implements a simple Invertion of Control / Dependency Injection in typescript inspired by the implementation of Inversify.

## IOC Container

Invertion of Control is a generic software architecture principle where separation of concern is achieved in a multilayer application (framework)
by identifying and injecting component's dependencies in it's constructor.
This means that objects do not create other objects on which they rely on to do their work. Instead, they get the objects that they need from an outside source.

Since IOC is a generic term, over the years, a more specific term was derived from it. Dependency Injection.
Dependency injection means that the implementation is done without the object's intervention, usually by a framework component that passes constructor parameters and set properties. (Injecting the dependencies) 

## The Container API

This simple implementation is inspired by the implementation of the Inversify JS module.
### Creating a container

The container is the place where all dependencies get bound to. It is possible to have
multiple container in our project in parallel.

```ts
import { IOCContainer } from "/src";
const iocContainer = new IOCContainer();
```

### Binding

#### Binding a class

This is the default way to bind a dependency. The class will get instantiated when the
dependency gets resolved.

```ts
iocContainer.bind<ILinkedList<number>>(symbol).to(LinkedList);
```

#### Binding a class in singleton scope

This will create only one instance of `LinkedList`

```ts
iocContainer.bind<ILinkedList<number>>(symbol).to(LinkedList).inSingletonScope();
```

#### Binding a factory

Factories are functions which will get called when the dependency gets resolved 

```ts
iocContainer.bind<ILinkedList<number>>(symbol).toFactory(() => new LinkedList<number>());
container.bind<string>(symbol).toFactory(() => "I'm a string");
```

A factory can be configured for singleton scope too. This way it will be executed only once.

```ts
iocContainer.bind<ILinkedList<number>>(symbol).toFactory(() => new LinkedList<number>()).inSingletonScope();
```

### Getting a dependency

Getting dependencies can be done without a decorator through `iocContainer.getItem()`. This is only meant for **unit tests**.
Using `container.get()`
directly to get dependencies can result in an infinite loops with circular dependencies when called inside of
the constructors. In addition `container.get()` does not respect the cache. 

> **Important Note:**  You should avoid accessing the dependencies from any constructor. With circular dependencies
> this can result in an infinite loop. 
 
```ts
iocContainer.getItem<Interface>(symbol);
```

### Removing a dependency

Normally this function is not used in production code. This will remove the
dependency from the container. 

```ts
ioContainer.removeItem(symbol);
```

## The `inject` Decorator

To use the decorator you have to set `experimentalDecorators` to `true`
in your `tsconfig.json`.

First we have to create a `inject` decorator for each container: 

```ts
import { createDecorator } from "/src";
export const inject = createDecorator(iocContainer);
```

Then we can use the decorator to inject the dependency.

```ts
class ExampleItem {

  @inject(symbol)
  linkedList!: ILinkedList<number>;
  
}
```

## The `symbol`

Symbols are used to identify our dependencies. A good practice is to keep them in one place.

```ts
export const TYPE = {
    "Service" = Symbol("Service"),
    // [...]
}
```

Symbols can be defined with `Symbol.for()` too. This way they are not unique.
Remember `Symbol('foo') === Symbol('foo')` is `false` but
`Symbol.for('foo') === Symbol.for('foo')` is `true`

```ts
export const TYPE = {
    "Service" = Symbol.for("Service"),
    // [...]
}
```

## Usage Example (see examples dir)


#### Step 1 - Creating symbols for our dependencies

We create a ***ioc-service*** and add define our dependencies:
```ts
const DATA_STRUCTURES = {
  linkedList: Symbol("LinkedList")
};
```

#### Step 2 - Creating a container

Next we need a container to bind our dependencies to.

```ts
import { IOCContainer } from "../src";
import { createDecorator } from "../src/ioc-container";
import { ILinkedList, LinkedList } from "./data-structures/linked-list";

const DATA_STRUCTURES = {
  linkedList: Symbol("LinkedList"),
  hashMap: Symbol("HashMap"),
};

const iocContainer = new IOCContainer();
const inject = createDecorator(iocContainer);

iocContainer
  .bind<ILinkedList<number>>(DATA_STRUCTURES.linkedList)
  .to(LinkedList);

export { iocContainer, inject, DATA_STRUCTURES };
```

#### Step 3 - Injecting dependencies

Lets create a ***index.ts*** file in our examples root dir:
We can rn **ts-node** from the terminal in the examples dir to see the output.
(change **module** flag in tsconfig to commonjs first)
 
```ts
import { DATA_STRUCTURES, inject } from "./ioc-service";
import { ILinkedList } from "./data-structures";

class ExampleItem {
  @inject(DATA_STRUCTURES.linkedList)
  linkedList!: ILinkedList<number>;
}

const exampleItem = new ExampleItem();
exampleItem.linkedList.add(1);
exampleItem.linkedList.add(10);
exampleItem.linkedList.add(5);

console.log("result", exampleItem.linkedList);
```

If we run this example we should see the content of our exampleItem services containing the linkedList.
