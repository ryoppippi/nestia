import { BadRequestException } from "@nestjs/common";
import typia, { IValidation, TypeGuardError } from "typia";

import { IRequestHeadersValidator } from "../../options/IRequestHeadersValidator";
import { NoTransformConfigurationError } from "../NoTransformConfigurationError";

/** @internal */
export const validate_request_headers = <T>(
  validator?: IRequestHeadersValidator<T>,
): ((input: Record<string, string | string[] | undefined>) => T | Error) => {
  if (!validator) {
    NoTransformConfigurationError("TypedHeaders");
    return (input: Record<string, string | string[] | undefined>) =>
      Object.entries(input) as T;
  } else if (validator.type === "assert") return assert(validator.assert);
  else if (validator.type === "is") return is(validator.is);
  else if (validator.type === "validate") return validate(validator.validate);
  return () =>
    new Error(`Error on nestia.core.TypedHeaders(): invalid typed validator.`);
};

/** @internal */
const assert =
  <T>(closure: (input: Record<string, string | string[] | undefined>) => T) =>
  (
    input: Record<string, string | string[] | undefined>,
  ): T | BadRequestException => {
    try {
      return closure(input);
    } catch (exp) {
      if (typia.is<TypeGuardError>(exp)) {
        return new BadRequestException({
          path: exp.path,
          reason: exp.message,
          expected: exp.expected,
          value: exp.value,
          message: MESSAGE,
        });
      }
      throw exp;
    }
  };

/** @internal */
const is =
  <T>(
    closure: (input: Record<string, string | string[] | undefined>) => T | null,
  ) =>
  (
    input: Record<string, string | string[] | undefined>,
  ): T | BadRequestException => {
    const result: T | null = closure(input);
    return result !== null ? result : new BadRequestException(MESSAGE);
  };

/** @internal */
const validate =
  <T>(
    closure: (
      input: Record<string, string | string[] | undefined>,
    ) => IValidation<T>,
  ) =>
  (
    input: Record<string, string | string[] | undefined>,
  ): T | BadRequestException => {
    const result: IValidation<T> = closure(input);
    return result.success
      ? result.data
      : new BadRequestException({
          errors: result.errors,
          message: MESSAGE,
        });
  };

/** @internal */
const MESSAGE = "Request headers data is not following the promised type.";
