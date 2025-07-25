import { IHttpMigrateRoute, OpenApi } from "@samchon/openapi";
import ts from "typescript";
import { IdentifierFactory } from "typia/lib/factories/IdentifierFactory";

import { INestiaMigrateConfig } from "../structures/INestiaMigrateConfig";
import { FilePrinter } from "../utils/FilePrinter";
import { NestiaMigrateImportProgrammer } from "./NestiaMigrateImportProgrammer";
import { NestiaMigrateSchemaProgrammer } from "./NestiaMigrateSchemaProgrammer";

export namespace NestiaMigrateApiFunctionProgrammer {
  export interface IContext {
    config: INestiaMigrateConfig;
    components: OpenApi.IComponents;
    importer: NestiaMigrateImportProgrammer;
    route: IHttpMigrateRoute;
  }

  export const write = (ctx: IContext): ts.FunctionDeclaration =>
    FilePrinter.description(
      ts.factory.createFunctionDeclaration(
        [
          ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
          ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword),
        ],
        undefined,
        ctx.route.accessor.at(-1)!,
        undefined,
        writeParameterDeclarations(ctx),
        ts.factory.createTypeReferenceNode("Promise", [
          ts.factory.createTypeReferenceNode(
            ctx.route.success === null
              ? "void"
              : `${ctx.route.accessor.at(-1)!}.Response`,
          ),
        ]),
        ts.factory.createBlock(writeBody(ctx), true),
      ),
      writeDescription(ctx.config, ctx.route),
    );

  export const writeParameterDeclarations = (
    ctx: IContext,
    connectionName?: string,
  ): ts.ParameterDeclaration[] => {
    const connection: ts.ParameterDeclaration = IdentifierFactory.parameter(
      connectionName ?? "connection",
      ts.factory.createTypeReferenceNode(
        ctx.importer.external({
          type: "instance",
          library: "@nestia/fetcher",
          name: "IConnection",
        }),
        ctx.route.headers
          ? [
              ts.factory.createTypeReferenceNode(
                `${ctx.route.accessor.at(-1)!}.Headers`,
              ),
            ]
          : undefined,
      ),
    );
    if (ctx.config.keyword === true) {
      const isProps: boolean =
        ctx.route.parameters.length > 0 ||
        !!ctx.route.query ||
        !!ctx.route.body;
      if (isProps === false) return [connection];
      return [
        connection,
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          "props",
          undefined,
          ts.factory.createTypeReferenceNode(
            `${ctx.route.accessor.at(-1)!}.Props`,
          ),
        ),
      ];
    }
    return [
      connection,
      ...ctx.route.parameters.map((p) =>
        IdentifierFactory.parameter(
          p.key,
          NestiaMigrateSchemaProgrammer.write({
            components: ctx.components,
            importer: ctx.importer,
            schema: p.schema,
          }),
        ),
      ),
      ...(ctx.route.query
        ? [
            IdentifierFactory.parameter(
              ctx.route.query.key,
              ts.factory.createTypeReferenceNode(
                `${ctx.route.accessor.at(-1)!}.Query`,
              ),
            ),
          ]
        : []),
      ...(ctx.route.body
        ? [
            IdentifierFactory.parameter(
              ctx.route.body.key,
              ts.factory.createTypeReferenceNode(
                `${ctx.route.accessor.at(-1)!}.Body`,
              ),
              (ctx.route.body.type === "application/json" ||
                ctx.route.body.type === "text/plain") &&
                ctx.route.operation().requestBody?.required === false
                ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
            ),
          ]
        : []),
    ];
  };

  const writeDescription = (
    config: INestiaMigrateConfig,
    route: IHttpMigrateRoute,
  ): string => {
    const comment: string = route.comment();
    return [
      config.keyword === true
        ? comment.split("@param ").join("@param props.")
        : comment,
      `@path ${route.emendedPath}`,
      `@${config.author?.tag ?? "nestia"} ${config.author?.value ?? "Generated by Nestia - https://github.com/samchon/nestia"}`,
    ].join("\n");
  };

  const writeBody = (ctx: IContext): ts.Statement[] => {
    const encrypted: boolean = !!ctx.route.success?.["x-nestia-encrypted"];
    const contentType: string = ctx.route.body?.type ?? "application/json";

    const property = (key: string): ts.Expression =>
      ctx.config.keyword === true
        ? IdentifierFactory.access(ts.factory.createIdentifier("props"), key)
        : ts.factory.createIdentifier(key);
    const fetch = () =>
      ts.factory.createCallExpression(
        IdentifierFactory.access(
          ts.factory.createIdentifier(
            ctx.importer.external({
              type: "instance",
              library: `@nestia/fetcher/lib/${encrypted ? "EncryptedFetcher" : "PlainFetcher"}`,
              name: encrypted ? "EncryptedFetcher" : "PlainFetcher",
            }),
          ),
          "fetch",
        ),
        undefined,
        [
          contentType && contentType !== "multipart/form-data"
            ? ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createSpreadAssignment(
                    ts.factory.createIdentifier("connection"),
                  ),
                  ts.factory.createPropertyAssignment(
                    "headers",
                    ts.factory.createObjectLiteralExpression(
                      [
                        ts.factory.createSpreadAssignment(
                          IdentifierFactory.access(
                            ts.factory.createIdentifier("connection"),
                            "headers",
                          ),
                        ),
                        ts.factory.createPropertyAssignment(
                          ts.factory.createStringLiteral("Content-Type"),
                          ts.factory.createStringLiteral(contentType),
                        ),
                      ],
                      true,
                    ),
                  ),
                ],
                true,
              )
            : ts.factory.createIdentifier("connection"),
          ts.factory.createObjectLiteralExpression(
            [
              ts.factory.createSpreadAssignment(
                IdentifierFactory.access(
                  ts.factory.createIdentifier(ctx.route.accessor.at(-1)!),
                  "METADATA",
                ),
              ),
              ts.factory.createPropertyAssignment(
                "path",
                ts.factory.createCallExpression(
                  IdentifierFactory.access(
                    ts.factory.createIdentifier(ctx.route.accessor.at(-1)!),
                    "path",
                  ),
                  undefined,
                  getArguments(ctx, false),
                ),
              ),
              ts.factory.createPropertyAssignment(
                "status",
                ts.factory.createNull(),
              ),
            ],
            true,
          ),
          ...(ctx.route.body ? [property(ctx.route.body.key)] : []),
        ],
      );
    if (ctx.config.simulate !== true)
      return [ts.factory.createReturnStatement(fetch())];
    return [
      ts.factory.createReturnStatement(
        ts.factory.createConditionalExpression(
          ts.factory.createStrictEquality(
            ts.factory.createTrue(),
            ts.factory.createIdentifier("connection.simulate"),
          ),
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createIdentifier(
              `${ctx.route.accessor.at(-1)!}.simulate`,
            ),
            [],
            [
              ts.factory.createIdentifier("connection"),
              ...getArguments(ctx, true),
            ],
          ),
          undefined,
          fetch(),
        ),
      ),
    ];
  };

  const getArguments = (ctx: IContext, body: boolean): ts.Expression[] => {
    if (
      ctx.route.parameters.length === 0 &&
      ctx.route.query === null &&
      (body === false || ctx.route.body === null)
    )
      return [];
    else if (ctx.config.keyword === true)
      return [ts.factory.createIdentifier("props")];
    return [
      ...ctx.route.parameters.map((p) => ts.factory.createIdentifier(p.key)),
      ...(ctx.route.query
        ? [ts.factory.createIdentifier(ctx.route.query.key)]
        : []),
      ...(body && ctx.route.body
        ? [ts.factory.createIdentifier(ctx.route.body.key)]
        : []),
    ];
  };
}
