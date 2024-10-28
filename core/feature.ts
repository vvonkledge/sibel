import type { Constructor } from "./container.ts";
import "reflect-metadata";

export interface Command {
  type: string;
}

export interface CommandHandler<T extends Command> {
  execute(command: T): void;
}

export interface Query {
  type: string;
}

export interface QueryHandler<T extends Query, R> {
  execute(query: T): R;
}

export type OswaldRequest = Command | Query;
export type OswaldRequestHandler =
  | CommandHandler<Command>
  | QueryHandler<Query, unknown>;

type SliceMetadata =
  | {
    TRIGGER: Constructor<Command>;
    HANDLER: Constructor<CommandHandler<Command>>;
  }
  | {
    TRIGGER: Constructor<Query>;
    HANDLER: Constructor<QueryHandler<Query, unknown>>;
  };

function Slice(metadata: SliceMetadata) {
  return function decorate(target: Constructor) {
    Reflect.defineMetadata(FEATURE_FINGERPRINT, true, target);

    Object.keys(metadata).forEach((property) => {
      if (Object.prototype.hasOwnProperty.call(metadata, property)) {
        Reflect.defineMetadata(
          property,
          metadata[property as keyof SliceMetadata],
          target,
        );
      }
    });
  };
}

export const FEATURE_FINGERPRINT = Symbol("OSWALD:FEATURE_FINGERPRINT");
export abstract class Feature {}

export default Slice;
