import * as E from "fp-ts/lib/Either.js";
import type {
  Command,
  CommandHandler,
  OswaldRequestHandler,
} from "./feature.ts";
import Container from "./container.ts";
import { Feature, FEATURE_FINGERPRINT, type OswaldRequest } from "./feature.ts";

class Oswald {
  public container = Container.getInstance();
  public features: Map<string, CommandHandler<Command>> = new Map();

  public registerFeature(feature: Feature): E.Either<string, void> {
    if (!Reflect.getMetadata(FEATURE_FINGERPRINT, feature)) {
      return E.left(
        `Invalid feature. Use @Slice() decorator. ${feature.constructor.name}`,
      );
    }
    const trigger = Reflect.getMetadata("TRIGGER", feature);
    const handler = Reflect.getMetadata("HANDLER", feature);

    this.container.register(handler.constructor.name, handler);
    this.features.set(trigger.name, handler);
    return E.right(undefined);
  }

  public serve(request: OswaldRequest) {
    const handlerConstructor = this.features.get(request.constructor.name);

    if (!handlerConstructor) {
      throw new Error(`Handler for ${request.constructor.name} not found`);
    }

    const handler = this.container.get(
      handlerConstructor.constructor.name,
    ) as OswaldRequestHandler;

    handler.execute(request);
  }
}

export default Oswald;
