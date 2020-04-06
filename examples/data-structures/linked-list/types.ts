import { LinkedListNode } from "./index";

export interface ILinkedList<T> {
  head?: LinkedListNode<T> | undefined;
  tail?: LinkedListNode<T> | undefined;
  add: (value: T) => void;
  dequeue: () => T | void;
  values: () => void;
}
