import type { Constructor } from "./container.ts";
import "reflect-metadata";

export const INJECT_METADATA_KEY = "inject:paramtypes";

export function Inject(token: Constructor) {
  return function (
    target: object,
    _: string | symbol | undefined,
    parameterIndex: number,
  ) {
    const existingInjectTokens: Constructor[] =
      Reflect.getOwnMetadata(INJECT_METADATA_KEY, target) || [];
    existingInjectTokens[parameterIndex] = token;
    Reflect.defineMetadata(INJECT_METADATA_KEY, existingInjectTokens, target);
  };
}
