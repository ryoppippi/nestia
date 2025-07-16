import { VERSION_NEUTRAL } from "@nestjs/common/interfaces";
import { IJsDocTagInfo } from "typia";

import { IReflectHttpOperationException } from "./IReflectHttpOperationException";
import { IReflectHttpOperationParameter } from "./IReflectHttpOperationParameter";
import { IReflectHttpOperationSuccess } from "./IReflectHttpOperationSuccess";
import { IReflectImport } from "./IReflectImport";

export interface IReflectHttpOperation {
  protocol: "http";
  function: Function;
  name: string;
  method: string;
  paths: string[];
  versions: Array<string | typeof VERSION_NEUTRAL> | undefined;
  parameters: IReflectHttpOperationParameter[];
  success: IReflectHttpOperationSuccess;
  exceptions: Record<string, IReflectHttpOperationException>;
  security: Record<string, string[]>[];
  tags: string[];
  imports: IReflectImport[];
  operationId: string | undefined;
  description: string | null;
  jsDocTags: IJsDocTagInfo[];
  extensions?: Record<string, any>;
}
