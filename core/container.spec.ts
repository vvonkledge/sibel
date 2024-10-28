// deno-lint-ignore-file no-unused-vars
import { assertEquals, assertThrows } from "@std/assert";
import Container, { Injectable } from "./container.ts";

Deno.test("Container - when registering a class, it should be retrievable", () => {
  // Arrange
  const container = Container.getInstance();
  container.clear();

  @Injectable()
  class TestService {}

  // Act
  const instance = container.get<TestService>("TestService");

  // Assert
  assertEquals(instance instanceof TestService, true);
});

Deno.test("Container - when registering a singleton, it should return the same instance", () => {
  // Arrange
  const container = Container.getInstance();
  container.clear();

  @Injectable({ singleton: true })
  class SingletonService {}

  // Act
  const instance1 = container.get<SingletonService>("SingletonService");
  const instance2 = container.get<SingletonService>("SingletonService");

  // Assert
  assertEquals(instance1, instance2);
});

Deno.test("Container - when resolving a class with dependencies, it should inject them correctly", () => {
  // Arrange
  const container = Container.getInstance();
  container.clear();

  @Injectable()
  class DependencyService {
    public value = "dependency";
  }

  @Injectable()
  class TestService {
    constructor(public dependency: DependencyService) {}
  }

  // Act
  const instance = container.get<TestService>("TestService");

  // Assert
  assertEquals(instance.dependency.value, "dependency");
});

Deno.test("Container - when getting an unregistered dependency, it should throw an error", () => {
  // Arrange
  const container = Container.getInstance();
  container.clear();

  // Act & Assert
  assertThrows(
    () => container.get<unknown>("UnregisteredService"),
    Error,
    "No registration found for UnregisteredService",
  );
});

Deno.test("Container - when clearing the container, it should remove all registrations", () => {
  // Arrange
  const container = Container.getInstance();
  container.clear();

  @Injectable()
  class TestService {}

  container.get<TestService>("TestService");

  // Act
  container.clear();

  // Assert
  assertThrows(
    () => container.get<TestService>("TestService"),
    Error,
    "No registration found for TestService",
  );
});

Deno.test("Container - when using multiple instances, it should return the same singleton", () => {
  // Arrange
  const container1 = Container.getInstance();
  const container2 = Container.getInstance();
  container1.clear();

  @Injectable({ singleton: true })
  class SingletonService {
    public value = Math.random();
  }

  // Act
  const instance1 = container1.get<SingletonService>("SingletonService");
  const instance2 = container2.get<SingletonService>("SingletonService");

  // Assert
  assertEquals(instance1.value, instance2.value);
});
