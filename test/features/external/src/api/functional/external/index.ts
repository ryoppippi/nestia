/**
 * @packageDocumentation
 * @module api.functional.external
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
//================================================================
import type { IConnection } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";
import type { IEmbedTypeScriptResult } from "embed-typescript";
import type { Primitive } from "typia";

/**
 * @controller ExternalController.compile
 * @path POST /external/compile
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function compile(
  connection: IConnection,
  files: compile.Body,
): Promise<compile.Output> {
  return PlainFetcher.fetch(
    {
      ...connection,
      headers: {
        ...connection.headers,
        "Content-Type": "application/json",
      },
    },
    {
      ...compile.METADATA,
      template: compile.METADATA.path,
      path: compile.path(),
    },
    files,
  );
}
export namespace compile {
  export type Body = Primitive<Record<string, string>>;
  export type Output = Primitive<IEmbedTypeScriptResult>;

  export const METADATA = {
    method: "POST",
    path: "/external/compile",
    request: {
      type: "application/json",
      encrypted: false,
    },
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: 201,
  } as const;

  export const path = () => "/external/compile";
}
