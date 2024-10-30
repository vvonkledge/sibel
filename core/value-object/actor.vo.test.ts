import { assertEquals, assertExists } from "@std/assert";
import Actor, { type ActorKind } from "./actor.vo.ts";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";

Deno.test("Actor Value Object", async (t) => {
  await t.step("should create a valid Actor with auto-generated UUID", () => {
    pipe(
      Actor.create({
        name: "Test Actor",
        kind: "H",
      }),
      E.map((actor) => {
        assertExists(actor);
        assertEquals(actor.name, "Test Actor");
        assertEquals(actor.kind, "H");
        assertExists(actor.id);
      }),
    );
  });

  await t.step("should create an Actor with provided UUID", () => {
    const validUUID = "123e4567-e89b-42d3-a456-556642440000";
    pipe(
      Actor.create({
        id: validUUID,
        name: "Test Actor",
        kind: "SYSTEM",
      }),
      E.map((actor) => {
        assertExists(actor);
        assertEquals(actor.name, "Test Actor");
        assertEquals(actor.kind, "SYSTEM");
        assertEquals(actor.id.getProps(), validUUID);
      }),
    );
  });

  await t.step("should reject invalid actor name", () => {
    pipe(
      Actor.create({
        name: "!", // Invalid name
        kind: "SERVICE",
      }),
      E.mapLeft((error) => {
        assertExists(error);
        assertEquals(error.message, "Invalid actor name format: !");
      }),
    );
  });

  await t.step("should reject invalid actor kind", () => {
    pipe(
      Actor.create({
        name: "Test Actor",
        kind: "INVALID" as unknown as ActorKind,
      }),
      E.mapLeft((error) => {
        assertExists(error);
        assertEquals(error.message, "Invalid actor kind: INVALID");
      }),
    );
  });

  await t.step("should reject invalid UUID", () => {
    pipe(
      Actor.create({
        id: "invalid-uuid",
        name: "Test Actor",
        kind: "H",
      }),
      E.mapLeft((error) => {
        assertExists(error);
        assertEquals(error.message, "Invalid UUID format: invalid-uuid");
      }),
    );
  });

  await t.step(
    "should validate name length between 2 and 100 characters",
    () => {
      pipe(
        Actor.create({
          name: "a", // Too short
          kind: "H",
        }),
        E.mapLeft((error) => {
          assertExists(error);
          assertEquals(error.message, "Invalid actor name format: a");
        }),
      );

      // Test with a name that's too long (101 characters)
      const longName = "a".repeat(101);
      pipe(
        Actor.create({
          name: longName,
          kind: "H",
        }),
        E.mapLeft((error) => {
          assertExists(error);
          assertEquals(error.message, `Invalid actor name format: ${longName}`);
        }),
      );
    },
  );
});
