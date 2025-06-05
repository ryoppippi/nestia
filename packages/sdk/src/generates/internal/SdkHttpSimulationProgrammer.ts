import ts from "typescript";
import { ExpressionFactory } from "typia/lib/factories/ExpressionFactory";
import { IdentifierFactory } from "typia/lib/factories/IdentifierFactory";
import { LiteralFactory } from "typia/lib/factories/LiteralFactory";
import { StatementFactory } from "typia/lib/factories/StatementFactory";
import { TypeFactory } from "typia/lib/factories/TypeFactory";

import { INestiaProject } from "../../structures/INestiaProject";
import { ITypedHttpRoute } from "../../structures/ITypedHttpRoute";
import { ITypedHttpRouteParameter } from "../../structures/ITypedHttpRouteParameter";
import { ImportDictionary } from "./ImportDictionary";
import { SdkAliasCollection } from "./SdkAliasCollection";
import { SdkImportWizard } from "./SdkImportWizard";

export namespace SdkHttpSimulationProgrammer {
  export const random =
    (project: INestiaProject) =>
    (importer: ImportDictionary) =>
    (route: ITypedHttpRoute): ts.VariableStatement => {
      const output = SdkAliasCollection.responseBody(project)(importer)(route);
      return constant("random")(
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              "g",
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier("Partial"),
                [
                  ts.factory.createTypeReferenceNode(
                    `${SdkImportWizard.typia(importer)}.IRandomGenerator`,
                  ),
                ],
              ),
            ),
          ],
          project.config.primitive === false
            ? output
            : ts.factory.createTypeReferenceNode(
                SdkImportWizard.Resolved(importer),
                [output],
              ),
          undefined,
          ts.factory.createCallExpression(
            IdentifierFactory.access(
              ts.factory.createIdentifier(SdkImportWizard.typia(importer)),
              "random",
            ),
            [output],
            [ts.factory.createIdentifier("g")],
          ),
        ),
      );
    };

  export const simulate =
    (project: INestiaProject) =>
    (importer: ImportDictionary) =>
    (
      route: ITypedHttpRoute,
      props: {
        headers: ITypedHttpRouteParameter.IHeaders | undefined;
        query: ITypedHttpRouteParameter.IQuery | undefined;
        body: ITypedHttpRouteParameter.IBody | undefined;
      },
    ): ts.VariableStatement => {
      const output: boolean =
        project.config.propagate === true ||
        route.success.metadata.size() !== 0;
      const caller = () =>
        ts.factory.createCallExpression(
          ts.factory.createIdentifier("random"),
          undefined,
          [
            ts.factory.createConditionalExpression(
              ts.factory.createLogicalAnd(
                ts.factory.createStrictEquality(
                  ts.factory.createStringLiteral("object"),
                  ts.factory.createTypeOfExpression(
                    ts.factory.createIdentifier("connection.simulate"),
                  ),
                ),
                ts.factory.createStrictInequality(
                  ts.factory.createNull(),
                  ts.factory.createIdentifier("connection.simulate"),
                ),
              ),
              undefined,
              ts.factory.createIdentifier("connection.simulate"),
              undefined,
              ts.factory.createIdentifier("undefined"),
            ),
          ],
        );

      return constant("simulate")(
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [
            IdentifierFactory.parameter(
              "connection",
              ts.factory.createTypeReferenceNode(
                SdkImportWizard.IConnection(importer),
                route.parameters.some(
                  (p) => p.category === "headers" && p.field === null,
                )
                  ? [
                      ts.factory.createTypeReferenceNode(
                        `${route.name}.Headers`,
                      ),
                    ]
                  : [],
              ),
            ),
            ...(project.config.keyword === true &&
            route.parameters.filter((p) => p.category !== "headers").length !==
              0
              ? [
                  ts.factory.createParameterDeclaration(
                    [],
                    undefined,
                    "props",
                    undefined,
                    ts.factory.createTypeReferenceNode("IProps"),
                  ),
                ]
              : route.parameters
                  .filter((p) => p.category !== "headers")
                  .map((p) =>
                    ts.factory.createParameterDeclaration(
                      [],
                      undefined,
                      p.name,
                      p.metadata.optional
                        ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                        : undefined,
                      project.config.primitive !== false &&
                        (p === props.query || p === props.body)
                        ? ts.factory.createTypeReferenceNode(
                            `${route.name}.${p === props.query ? "Query" : "RequestBody"}`,
                          )
                        : project.config.clone === true
                          ? SdkAliasCollection.from(project)(importer)(
                              p.metadata,
                            )
                          : SdkAliasCollection.name(p),
                    ),
                  )),
          ],
          ts.factory.createTypeReferenceNode(output ? "Response" : "void"),
          undefined,
          ts.factory.createBlock(
            [
              ...assert(project)(importer)(route),
              ts.factory.createReturnStatement(
                project.config.propagate
                  ? ts.factory.createAsExpression(
                      ts.factory.createObjectLiteralExpression(
                        [
                          ts.factory.createPropertyAssignment(
                            "success",
                            ts.factory.createTrue(),
                          ),
                          ts.factory.createPropertyAssignment(
                            "status",
                            ExpressionFactory.number(
                              route.success.status ??
                                (route.method === "POST" ? 201 : 200),
                            ),
                          ),
                          ts.factory.createPropertyAssignment(
                            "headers",
                            LiteralFactory.write({
                              "Content-Type": route.success.contentType,
                            }),
                          ),
                          ts.factory.createPropertyAssignment("data", caller()),
                        ],
                        true,
                      ),
                      ts.factory.createTypeReferenceNode("Response"),
                    )
                  : caller(),
              ),
            ],
            true,
          ),
        ),
      );
    };

  const assert =
    (project: INestiaProject) =>
    (importer: ImportDictionary) =>
    (route: ITypedHttpRoute): ts.Statement[] => {
      const parameters = route.parameters.filter(
        (p) => p.category !== "headers",
      );
      if (parameters.length === 0) return [];

      const access = (key: string) =>
        project.config.keyword === true
          ? IdentifierFactory.access(ts.factory.createIdentifier("props"), key)
          : ts.factory.createIdentifier(key);
      const typia = SdkImportWizard.typia(importer);
      const validator = StatementFactory.constant({
        name: "assert",
        value: ts.factory.createCallExpression(
          IdentifierFactory.access(
            ts.factory.createIdentifier(
              importer.external({
                type: false,
                library: `@nestia/fetcher/lib/NestiaSimulator`,
                instance: "NestiaSimulator",
              }),
            ),
            "assert",
          ),
          undefined,
          [
            ts.factory.createObjectLiteralExpression(
              [
                ts.factory.createPropertyAssignment(
                  "method",
                  ts.factory.createIdentifier("METADATA.method"),
                ),
                ts.factory.createPropertyAssignment(
                  "host",
                  ts.factory.createIdentifier("connection.host"),
                ),
                ts.factory.createPropertyAssignment(
                  "path",
                  ts.factory.createCallExpression(
                    ts.factory.createIdentifier("path"),
                    undefined,
                    project.config.keyword === true &&
                      route.parameters.filter(
                        (p) => p.category === "param" || p.category === "query",
                      ).length !== 0
                      ? [ts.factory.createIdentifier("props")]
                      : route.parameters
                          .filter(
                            (p) =>
                              p.category === "param" || p.category === "query",
                          )
                          .map((p) => ts.factory.createIdentifier(p.name)),
                  ),
                ),
                ts.factory.createPropertyAssignment(
                  "contentType",
                  ts.factory.createIdentifier(
                    JSON.stringify(route.success.contentType),
                  ),
                ),
              ],
              true,
            ),
          ],
        ),
      });
      const individual = parameters
        .map((p) =>
          ts.factory.createCallExpression(
            (() => {
              const base = IdentifierFactory.access(
                ts.factory.createIdentifier("assert"),
                p.category,
              );
              if (p.category !== "param") return base;
              return ts.factory.createCallExpression(base, undefined, [
                ts.factory.createStringLiteral(p.name),
              ]);
            })(),
            undefined,
            [
              ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                undefined,
                ts.factory.createCallExpression(
                  IdentifierFactory.access(
                    ts.factory.createIdentifier(typia),
                    "assert",
                  ),
                  undefined,
                  [access(p.name)],
                ),
              ),
            ],
          ),
        )
        .map(ts.factory.createExpressionStatement);

      return [
        validator,
        ...(project.config.propagate !== true
          ? individual
          : [tryAndCatch(importer)(individual)]),
      ];
    };

  const tryAndCatch =
    (importer: ImportDictionary) => (individual: ts.Statement[]) =>
      ts.factory.createTryStatement(
        ts.factory.createBlock(individual, true),
        ts.factory.createCatchClause(
          "exp",
          ts.factory.createBlock(
            [
              ts.factory.createIfStatement(
                ts.factory.createLogicalNot(
                  ts.factory.createCallExpression(
                    IdentifierFactory.access(
                      ts.factory.createIdentifier(
                        SdkImportWizard.typia(importer),
                      ),
                      "is",
                    ),
                    [
                      ts.factory.createTypeReferenceNode(
                        SdkImportWizard.HttpError(importer),
                      ),
                    ],
                    [ts.factory.createIdentifier("exp")],
                  ),
                ),
                ts.factory.createThrowStatement(
                  ts.factory.createIdentifier("exp"),
                ),
              ),
              ts.factory.createReturnStatement(
                ts.factory.createAsExpression(
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createPropertyAssignment(
                        "success",
                        ts.factory.createFalse(),
                      ),
                      ts.factory.createPropertyAssignment(
                        "status",
                        ts.factory.createIdentifier("exp.status"),
                      ),
                      ts.factory.createPropertyAssignment(
                        "headers",
                        ts.factory.createIdentifier("exp.headers"),
                      ),
                      ts.factory.createPropertyAssignment(
                        "data",
                        ts.factory.createIdentifier("exp.toJSON().message"),
                      ),
                    ],
                    true,
                  ),
                  TypeFactory.keyword("any"),
                ),
              ),
            ],
            true,
          ),
        ),
        undefined,
      );
}

const constant = (name: string) => (expression: ts.Expression) =>
  ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(name),
          undefined,
          undefined,
          expression,
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
