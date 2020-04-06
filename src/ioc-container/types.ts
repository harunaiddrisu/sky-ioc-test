export interface ItemProps<T> {
  object?: NewItemObject<T>;
  factory?: Factory<T>;
  cache?: T;
  singleton: boolean;
}

export interface NewItemObject<T> {
  new (...args: any[]): T;
}

export type Registry = Map<symbol, ItemProps<any>>;

export type Factory<T> = () => T;
