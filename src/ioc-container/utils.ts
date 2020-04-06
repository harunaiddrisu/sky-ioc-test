import { Factory, ItemProps, NewItemObject } from "./types";
import { IOCContainer } from "./index";

export const NOCACHE = Symbol("NOCACHE");

/**
 * Secondary class used to bind the dependency to as have additional flexibility like creating a singleton scope
 */
class ItemBinderOptions<T> {
  constructor(private _target: ItemProps<T>) {}

  inSingletonScope() {
    this._target.singleton = true;
  }
}

/**
 * Generic Class used to bind a dependency to. This will act as a container for the generic dependency we just added to the container
 * @param type A symbol representing the dependency we would like to bind,
 * @returns a class ItemBinder<T> with the dependency of type injected in it's constructor.
 */
export class ItemBinder<T> {
  constructor(private _itemProps: ItemProps<T>) {}

  /**
   * This will bind the dependency to an object of type NewItemObject<T> (param object)
   * @param object Class that will be used to create the object we would like to bind to,
   * @returns ItemBinderOptions<T>. A second class to whom we will inject the injected dependency.
   * This will allow us to make the dependency for example a singleton
   */
  to(object: NewItemObject<T>): ItemBinderOptions<T> {
    this._itemProps.object = object;
    return new ItemBinderOptions<T>(this._itemProps);
  }

  /**
   * This will bind the dependency to a factory of type Factory<T> (param object)
   * @param factory function that will be used to bind the dependency to,
   * @returns ItemBinderOptions<T>. A second class to whom we will inject the injected dependency.
   * This will allow us to make the dependency for example a singleton
   */
  toFactory(factory: Factory<T>): ItemBinderOptions<T> {
    this._itemProps.factory = factory;
    return new ItemBinderOptions<T>(this._itemProps);
  }
}

// Util functions

/**
 * Function used by the decorator to define the new dependency property on the object
 * @param target object on which we would like to define the new property,
 * @param property the new property,
 * @param container the IOC Container,
 * @param type symbol representing the dependency type,
 * @param args the rest of arguments,
 */
function define(
  target: object,
  property: string,
  container: IOCContainer,
  type: symbol,
  args: symbol[]
) {
  Object.defineProperty(target, property, {
    get: function () {
      const value = container.getItem<any>(type);
      if (args.indexOf(NOCACHE) === -1) {
        Object.defineProperty(this, property, {
          value,
          enumerable: true,
        });
      }
      return value;
    },
    configurable: true,
    enumerable: true,
  });
}

/**
 * Creates the inject function used as decorator
 * @param container the IOC Container,
 * @param type symbol representing the dependency type,
 * @param args the rest of arguments,
 */
function inject(type: symbol, container: IOCContainer, args: symbol[]) {
  return (target: object, property: string): void => {
    define(target, property, container, type, args);
  };
}

/**
 * Creates the decorator
 * @param container the IOC Container,
 */
export function createDecorator(container: IOCContainer) {
  return (type: symbol, ...args: symbol[]) => {
    return inject(type, container, args);
  };
}
