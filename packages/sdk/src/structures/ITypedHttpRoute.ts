import { IJsDocTagInfo } from "typia";

import { IReflectController } from "./IReflectController";
import { IReflectTypeImport } from "./IReflectTypeImport";
import { ITypedHttpRouteException } from "./ITypedHttpRouteException";
import { ITypedHttpRouteParameter } from "./ITypedHttpRouteParameter";
import { ITypedHttpRouteSuccess } from "./ITypedHttpRouteSuccess";

export interface ITypedHttpRoute {
  protocol: "http";
  function: Function;
  controller: IReflectController;
  name: string;
  method: string;
  path: string;
  accessor: string[];

  // PARAMETERS
  pathParameters: ITypedHttpRouteParameter.IPath[];
  queryParameters: ITypedHttpRouteParameter.IQuery[];
  headerParameters: ITypedHttpRouteParameter.IHeaders[];
  queryObject: ITypedHttpRouteParameter.IQuery | null;
  headerObject: ITypedHttpRouteParameter.IHeaders | null;
  body: ITypedHttpRouteParameter.IBody | null;

  // RESPONSES
  success: ITypedHttpRouteSuccess;
  exceptions: Record<
    number | "2XX" | "3XX" | "4XX" | "5XX",
    ITypedHttpRouteException
  >;

  // ADDITIONAL INFORMATION
  security: Record<string, string[]>[];
  tags: string[];
  imports: IReflectTypeImport[];
  description: string | null;
  jsDocTags: IJsDocTagInfo[];
  operationId: string | undefined;
  extensions?: Record<string, any>;
}
