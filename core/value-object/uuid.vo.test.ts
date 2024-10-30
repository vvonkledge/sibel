import { assertEquals, assertExists } from "@std/assert";
import UUID from "./uuid.vo.ts";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";

Deno.test("UUID Value Object", async (t) => {
  await t.step("should create a valid UUID when no value is provided", () => {
    pipe(
      UUID.create(),
      E.map((uuid) => {
        assertExists(uuid);
        assertEquals(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            .test(
              uuid.getProps(),
            ),
          true,
        );
      }),
    );
  });

  await t.step("should create a UUID from valid string", () => {
    const validUUID = "123e4567-e89b-42d3-a456-556642440000";
    pipe(
      UUID.create(validUUID),
      E.map((uuid) => {
        assertExists(uuid);
        assertEquals(uuid.getProps(), validUUID);
      }),
    );
  });

  await t.step("should reject invalid UUID format", () => {
    const invalidUUID = "invalid-uuid";
    pipe(
      UUID.create(invalidUUID),
      E.mapLeft((error) => {
        assertExists(error);
        assertEquals(error.message, `Invalid UUID format: ${invalidUUID}`);
      }),
    );
  });

  await t.step("should reject malformed UUID", () => {
    const malformedUUID = "123e4567-e89b-12d3-a456-55664244"; // incomplete UUID
    pipe(
      UUID.create(malformedUUID),
      E.mapLeft((error) => {
        assertExists(error);
        assertEquals(error.message, `Invalid UUID format: ${malformedUUID}`);
      }),
    );
  });
});
