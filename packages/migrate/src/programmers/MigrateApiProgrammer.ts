import { HashMap, hash } from "tstl";
import ts from "typescript";

import { IHttpMigrateFile } from "../structures/IHttpMigrateFile";
import { IHttpMigrateProgram } from "../structures/IHttpMigrateProgram";
import { FilePrinter } from "../utils/FilePrinter";
import { MigrateApiFileProgrammer } from "./MigrateApiFileProgrammer";
import { MigrateDtoProgrammer } from "./MigrateDtoProgrammer";
import { MigrateImportProgrammer } from "./MigrateImportProgrammer";

export namespace MigrateApiProgrammer {
  export const write = (program: IHttpMigrateProgram): IHttpMigrateFile[] => {
    const dict: HashMap<string[], MigrateApiFileProgrammer.IProps> =
      new HashMap(
        (x) => hash(x.join(".")),
        (x, y) => x.length === y.length && x.join(".") === y.join("."),
      );
    for (const route of program.routes) {
      const namespace: string[] = route.accessor.slice(0, -1);
      let last: MigrateApiFileProgrammer.IProps = dict.take(namespace, () => ({
        namespace,
        routes: [],
        children: new Set(),
      }));
      last.routes.push(route);
      namespace.forEach((_s, i, array) => {
        const partial: string[] = namespace.slice(0, array.length - i - 1);
        const props: MigrateApiFileProgrammer.IProps = dict.take(
          partial,
          () => ({
            namespace: partial,
            children: new Set(),
            routes: [],
          }),
        );
        props.children.add(last.namespace.at(-1)!);
        last = props;
      });
    }

    // DO GENERATE
    const output: IHttpMigrateFile[] = [...dict].map(({ second: props }) => ({
      location: `src/${program.mode === "nest" ? "api/" : ""}functional/${props.namespace.join("/")}`,
      file: "index.ts",
      content: FilePrinter.write({
        statements: MigrateApiFileProgrammer.write(program)(
          program.document.components,
        )(props),
      }),
    }));
    if (program.mode === "sdk")
      output.push(
        ...[
          ...MigrateDtoProgrammer.compose(program)(
            program.document.components,
          ).entries(),
        ].map(([key, value]) => ({
          location: "src/structures",
          file: `${key}.ts`,
          content: FilePrinter.write({
            statements: writeDtoFile(key, value),
          }),
        })),
      );
    return output;
  };

  const writeDtoFile = (
    key: string,
    modulo: MigrateDtoProgrammer.IModule,
  ): ts.Statement[] => {
    const importer = new MigrateImportProgrammer();
    const statements: ts.Statement[] = iterate(importer)(modulo);
    if (statements.length === 0) return [];

    return [
      ...importer.toStatements((name) => `./${name}`, key),
      ...(importer.empty() ? [] : [FilePrinter.newLine()]),
      ...statements,
    ];
  };

  const iterate =
    (importer: MigrateImportProgrammer) =>
    (modulo: MigrateDtoProgrammer.IModule): ts.Statement[] => {
      const output: ts.Statement[] = [];
      if (modulo.programmer !== null) output.push(modulo.programmer(importer));
      if (modulo.children.size !== 0) {
        const internal: ts.Statement[] = [];
        for (const child of modulo.children.values())
          internal.push(...iterate(importer)(child));
        output.push(
          ts.factory.createModuleDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createIdentifier(modulo.name),
            ts.factory.createModuleBlock(internal),
            ts.NodeFlags.Namespace,
          ),
        );
      }
      output.push(FilePrinter.newLine());
      return output;
    };
}
