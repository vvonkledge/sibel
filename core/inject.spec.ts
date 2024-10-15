import { assertEquals } from "@std/assert";
import { Inject, INJECT_METADATA_KEY } from "./inject.ts";

Deno.test("Inject decorator adds metadata correctly", () => {
  class TestToken {}
  class TestClass {
    constructor(@Inject(TestToken) private dependency: TestToken) {}
  }

  const metadata = Reflect.getMetadata(INJECT_METADATA_KEY, TestClass);
  assertEquals(metadata[0], TestToken);
});

Deno.test("Inject decorator handles multiple injections", () => {
  class TestToken1 {}
  class TestToken2 {}
  class TestClass {
    constructor(
      @Inject(TestToken1) private dep1: TestToken1,
      @Inject(TestToken2) private dep2: TestToken2,
    ) {}
  }

  const metadata = Reflect.getMetadata(INJECT_METADATA_KEY, TestClass);
  assertEquals(metadata[0], TestToken1);
  assertEquals(metadata[1], TestToken2);
});
