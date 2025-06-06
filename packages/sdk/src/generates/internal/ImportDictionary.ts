import path from "path";
import { HashMap, HashSet, Pair } from "tstl";
import ts from "typescript";

import { FilePrinter } from "./FilePrinter";

export class ImportDictionary {
  private readonly components_: HashMap<Pair<string, boolean>, IComposition> =
    new HashMap();

  public constructor(public readonly file: string) {}

  public empty(): boolean {
    return this.components_.empty();
  }

  public external(props: ImportDictionary.IExternalProps): string {
    const key: string = `node_modules/${props.library}`;
    const composition: IComposition = this.components_.take(
      new Pair(key, props.type),
      () => ({
        location: key,
        elements: new HashSet(),
        default: false,
        type: props.type,
      }),
    );
    if (props.instance === null) composition.default = true;
    else composition.elements.insert(props.instance);
    return props.instance ?? props.library;
  }

  public internal(props: ImportDictionary.IInternalProps): string {
    const file: string = normalize(
      (() => {
        if (props.file.substring(props.file.length - 5) === ".d.ts")
          return props.file.substring(0, props.file.length - 5);
        else if (props.file.substring(props.file.length - 3) === ".ts")
          return props.file.substring(0, props.file.length - 3);
        return props.file;
      })(),
    );
    const composition: IComposition = this.components_.take(
      new Pair(file, props.type),
      () => ({
        location: file,
        elements: new HashSet(),
        default: false,
        type: props.type,
      }),
    );
    if (props.instance === null) {
      composition.default = true;
      if (props.name) composition.name = props.name;
    } else composition.elements.insert(props.instance);
    return props.instance ?? file;
  }

  public toStatements(outDir: string): ts.Statement[] {
    outDir = path.resolve(outDir);
    const external: ts.ImportDeclaration[] = [];
    const internal: ts.ImportDeclaration[] = [];

    const locator = (str: string) => {
      const location: string = path
        .relative(outDir, str)
        .split(path.sep)
        .join("/");
      const index: number = location.lastIndexOf(NODE_MODULES);
      return index === -1
        ? location.startsWith("..")
          ? location
          : `./${location}`
        : location.substring(index + NODE_MODULES.length);
    };
    const enroll =
      (filter: (str: string) => boolean) =>
      (container: ts.ImportDeclaration[]) => {
        const compositions: IComposition[] = this.components_
          .toJSON()
          .filter((c) => filter(c.second.location))
          .map((e) => ({
            ...e.second,
            location: locator(e.second.location),
          }))
          .sort((a, b) => a.location.localeCompare(b.location));
        for (const c of compositions) {
          const brackets: string[] = [];
          if (c.default) brackets.push(c.name ?? c.location);
          if (c.elements.empty() === false)
            brackets.push(
              `{ ${c.elements
                .toJSON()
                .sort((a, b) => a.localeCompare(b))
                .join(", ")} }`,
            );
          container.push(
            ts.factory.createImportDeclaration(
              undefined,
              ts.factory.createImportClause(
                c.type,
                c.default
                  ? ts.factory.createIdentifier(c.name ?? c.location)
                  : undefined,
                c.elements.empty() === false
                  ? ts.factory.createNamedImports(
                      [...c.elements].map((elem) =>
                        ts.factory.createImportSpecifier(
                          false,
                          undefined,
                          ts.factory.createIdentifier(elem),
                        ),
                      ),
                    )
                  : undefined,
              ),
              ts.factory.createStringLiteral(c.location),
            ),
          );
        }
      };

    enroll((str) => str.indexOf(NODE_MODULES) !== -1)(external);
    enroll((str) => str.indexOf(NODE_MODULES) === -1)(internal);
    return [
      ...external,
      ...(external.length && internal.length ? [FilePrinter.enter()] : []),
      ...internal,
    ];
  }
}
export namespace ImportDictionary {
  export interface IExternalProps {
    type: boolean;
    library: string;
    instance: string | null;
  }
  export interface IInternalProps {
    type: boolean;
    file: string;
    instance: string | null;
    name?: string | null;
  }
}

interface IComposition {
  location: string;
  type: boolean;
  default: boolean;
  name?: string;
  elements: HashSet<string>;
}

const NODE_MODULES = "node_modules/";

const normalize = (file: string): string => {
  file = path.resolve(file);
  if (file.includes(`node_modules${path.sep}`))
    file =
      "node_modules/" +
      file.split(`node_modules${path.sep}`).at(-1)!.split(path.sep).join("/");
  return file;
};
