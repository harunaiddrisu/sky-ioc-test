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
