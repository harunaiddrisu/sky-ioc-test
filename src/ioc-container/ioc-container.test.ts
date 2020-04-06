import { IOCContainer } from "./index";

describe("IOCContainer", () => {
  let container: IOCContainer;

  const testSymbol = Symbol.for("example");

  beforeEach(() => {
    container = new IOCContainer();
  });

  test("can bind a factory", () => {
    let count = 1;
    container
      .bind<string>(testSymbol)
      .toFactory(() => `hello world ${count++}`);

    expect(container.getItem<string>(testSymbol)).toBe("hello world 1");
    expect(container.getItem<string>(testSymbol)).toBe("hello world 2");
    expect(container.getItem<string>(testSymbol)).toBe("hello world 3");
  });

  test("can bind a factory in singleton scope", () => {
    let count = 1;
    container
      .bind<string>(testSymbol)
      .toFactory(() => `hello world ${count++}`)
      .inSingletonScope();

    expect(container.getItem<string>(testSymbol)).toBe("hello world 1");
    expect(container.getItem<string>(testSymbol)).toBe("hello world 1");
    expect(container.getItem<string>(testSymbol)).toBe("hello world 1");
  });

  test("should use cached data in singleton scope", () => {
    const spy = jest.fn();
    spy.mockReturnValue("test");

    container.bind<string>(testSymbol).toFactory(spy).inSingletonScope();

    container.getItem(testSymbol);
    container.getItem(testSymbol);
    container.getItem(testSymbol);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(container.getItem<string>(testSymbol)).toBe("test");
  });

  test("can bind a constructable", () => {
    interface IExampleConstructable {
      hello(): string;
    }
    container.bind<IExampleConstructable>(testSymbol).to(
      class implements IExampleConstructable {
        count = 1;
        hello() {
          return `world ${this.count++}`;
        }
      }
    );

    expect(container.getItem<IExampleConstructable>(testSymbol).hello()).toBe(
      "world 1"
    );
    expect(container.getItem<IExampleConstructable>(testSymbol).hello()).toBe(
      "world 1"
    );
    expect(container.getItem<IExampleConstructable>(testSymbol).hello()).toBe(
      "world 1"
    );
  });

  test("can bind a constructable in singleton scope", () => {
    interface IExampleConstructable {
      hello(): string;
    }
    container
      .bind<IExampleConstructable>(testSymbol)
      .to(
        class implements IExampleConstructable {
          count = 1;
          hello() {
            return `world ${this.count++}`;
          }
        }
      )
      .inSingletonScope();

    expect(container.getItem<IExampleConstructable>(testSymbol).hello()).toBe(
      "world 1"
    );
    expect(container.getItem<IExampleConstructable>(testSymbol).hello()).toBe(
      "world 2"
    );
    expect(container.getItem<IExampleConstructable>(testSymbol).hello()).toBe(
      "world 3"
    );
  });

  test("can not bind to a symbol more than once", () => {
    container.bind(testSymbol);
    expect(() => container.bind(testSymbol)).toThrow(
      "object can only bound once: Symbol(example)"
    );
  });

  test("can not get unbound dependency", () => {
    container.bind(testSymbol);
    expect(() => container.getItem<string>(testSymbol)).toThrow(
      "nothing is bound to Symbol(example)"
    );
  });

  test("can remove a symbol", () => {
    container.bind<string>(testSymbol).toFactory(() => `hello world`);
    expect(container.getItem(testSymbol)).toBe("hello world");

    container.removeItem(testSymbol);
    expect(() => container.getItem(testSymbol)).toThrow(
      "nothing bound to Symbol(example)"
    );
  });
});
