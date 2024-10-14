import "reflect-metadata";
import { INJECT_METADATA_KEY } from "./inject.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T = unknown> = new (...args: any[]) => T;

/**
 * Container class for dependency injection.
 * Manages registrations, singletons, and resolves dependencies.
 */
class Container {
  private static instance: Container | null = null;
  private registrations: Map<string, () => unknown> = new Map();
  private singletons: Map<string, unknown> = new Map();
  private resolutionStack: Set<string> = new Set();

  /**
   * Gets the singleton instance of the Container.
   * @returns {Container} The singleton instance of the Container.
   */
  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Clears all registrations, singletons, and the resolution stack.
   */
  public clear(): void {
    this.registrations = new Map();
    this.singletons = new Map();
    this.resolutionStack = new Set();
  }

  /**
   * Registers a constructor with the container.
   * @param {string} key - The key to register the constructor under.
   * @param {Constructor<T>} ctor - The constructor to register.
   */
  register<T>(key: string, ctor: Constructor<T>): void {
    this.registrations.set(key, () => this.resolve(ctor));
  }

  /**
   * Resolves a constructor, creating an instance with its dependencies.
   * @param {Constructor<T>} Ctor - The constructor to resolve.
   * @returns {T} An instance of the resolved constructor.
   * @throws {Error} If a circular dependency is detected.
   */
  resolve<T>(Ctor: Constructor<T>): T {
    const key = Ctor.name;

    if (this.resolutionStack.has(key)) {
      throw new Error(
        `Circular dependency detected: ${
          Array.from(this.resolutionStack).join(" -> ")
        } -> ${key}.\n
            Ensure that none of your dependencies are calling each other.`,
      );
    }

    this.resolutionStack.add(key);

    try {
      const paramTypes = Reflect.getMetadata("design:paramtypes", Ctor) || [];
      const injectTokens = Reflect.getMetadata(INJECT_METADATA_KEY, Ctor) || [];

      const injections = paramTypes.map((type: Constructor, index: number) => {
        const injectToken = injectTokens[index];
        return injectToken ? this.get(injectToken.name) : this.get(type.name);
      });

      return new Ctor(...injections);
    } finally {
      this.resolutionStack.delete(key);
    }
  }

  /**
   * Gets an instance of a registered dependency.
   * @param {string} key - The key of the registered dependency.
   * @returns {T} An instance of the requested dependency.
   * @throws {Error} If no registration is found for the given key.
   */
  get<T>(key: string): T {
    const factory = this.registrations.get(key);
    if (!factory) {
      throw new Error(`No registration found for ${key}.`);
    }

    return factory() as T;
  }

  /**
   * Registers a singleton with the container.
   * @param {string} key - The key to register the singleton under.
   * @param {Constructor<T>} ctor - The constructor for the singleton.
   */
  registerSingleton<T>(key: string, ctor: Constructor<T>): void {
    this.registrations.set(key, () => {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, this.resolve(ctor));
      }
      return this.singletons.get(key);
    });
  }
}

type InjectableOptions = {
  singleton?: boolean;
};

/**
 * Decorator function to mark a class as injectable and register it with the container.
 * @param {InjectableOptions} options - Options for the injectable, including whether it should be a singleton.
 * @returns {ClassDecorator} A decorator function to be applied to a class.
 */
export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  // deno-lint-ignore no-explicit-any
  return (target: any) => {
    const container = Container.getInstance();
    if (options.singleton) {
      container.registerSingleton(target.name, target);
    } else {
      container.register(target.name, target);
    }
  };
}

export default Container;
