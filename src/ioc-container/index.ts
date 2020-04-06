export { createDecorator } from "./utils";
import { ItemProps, Registry } from "./types";
import { ItemBinder } from "./utils";

export class IOCContainer {
  /**
   * Collection to register all dependencies
   */
  private _registry: Registry = new Map<symbol, ItemProps<any>>();

  /**
   * Binds a dependency to the container
   * @param type A symbol representing the dependency we would like to bind,
   * @returns a class ItemBinder<T> with the dependency of type injected in it's constructor.
   */
  bind<T = never>(type: symbol): ItemBinder<T> {
    return new ItemBinder<T>(this._addItem<T>(type));
  }

  /**
   * Adds a new dependency of type (symbol) to the map collection.
   * @param type A symbol representing the dependency we would like to bind,
   * @returns the new dependency object.
   * This will be passed / injected into ItemBinder
   */
  private _addItem<T>(type: symbol): ItemProps<T> {
    if (this._registry.get(type) !== undefined) {
      throw `object can only bound once: ${type.toString()}`;
    }

    const props = { singleton: false };
    this._registry.set(type, props);

    return props;
  }

  /**
   * Retrieves a dependency of type symbol from the collection.
   * @param type A symbol representing the dependency we would like to retrieve,
   * @returns object or factory of type T
   */
  getItem<T = never>(type: symbol): T {
    const regItem = this._registry.get(type);

    if (regItem === undefined) {
      throw `nothing bound to ${type.toString()}`;
    }

    const { object, factory, cache, singleton } = regItem;

    const cacheItem = (creator: () => T): T => {
      if (singleton && typeof cache !== "undefined") return cache;
      if (!singleton) return creator();
      regItem.cache = creator();
      return regItem.cache;
    };

    if (typeof object !== "undefined") return cacheItem(() => new object());
    if (typeof factory !== "undefined") return cacheItem(() => factory());

    throw `nothing is bound to ${type.toString()}`;
  }

  /**
   * Removes a dependency from the collection.
   * @param type A symbol representing the dependency we would like to remove,
   * @returns the container
   */
  removeItem(type: symbol): IOCContainer {
    if (this._registry.get(type) === undefined) {
      throw `${type.toString()} was never bound`;
    }

    this._registry.delete(type);

    return this;
  }
}
