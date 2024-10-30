import ValueObject from "./value-object.ts";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class UUID extends ValueObject<string> {
  private constructor(props: string) {
    super(props);
  }

  public static create(value?: string): E.Either<Error, UUID> {
    return pipe(
      E.of(value),
      E.chain((val) =>
        val
          ? E.fromPredicate(
            (val: string) => uuidRegex.test(val),
            () => new Error(`Invalid UUID format: ${val}`),
          )(val)
          : E.right(crypto.randomUUID())
      ),
      E.map((uuid) => new UUID(uuid)),
    );
  }
}

export default UUID;
