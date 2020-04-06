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
