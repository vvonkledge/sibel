import ValueObject from "./value-object.ts";
import UUID from "./uuid.vo.ts";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";

export type ActorKind = "H" | "SYSTEM" | "SERVICE";

interface ActorProps {
  id: UUID;
  name: string;
  kind: ActorKind;
}

const nameRegex = /^[A-Za-z0-9\s\-_.]{2,100}$/;

class Actor extends ValueObject<ActorProps> {
  private constructor(props: ActorProps) {
    super(props);
  }

  public static create(props: {
    id?: string;
    name: string;
    kind: ActorKind;
  }): E.Either<Error, Actor> {
    return pipe(
      E.Do,
      E.bind("name", () =>
        E.fromPredicate(
          (name: string) => nameRegex.test(name),
          () => new Error(`Invalid actor name format: ${props.name}`),
        )(props.name)),
      E.bind("kind", () =>
        E.fromPredicate(
          () => ["H", "SYSTEM", "SERVICE"].includes(props.kind),
          () => new Error(`Invalid actor kind: ${props.kind}`),
        )(props.kind)),
      E.bind("id", () => UUID.create(props.id)),
      E.map(({ id, name, kind }) => new Actor({ id, name, kind })),
    );
  }

  public get id(): UUID {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get kind(): ActorKind {
    return this.props.kind;
  }
}

export default Actor;
