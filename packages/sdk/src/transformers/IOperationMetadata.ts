import { IJsDocTagInfo } from "typia";
import { IMetadata } from "typia/lib/schemas/metadata/IMetadata";
import { IMetadataComponents } from "typia/lib/schemas/metadata/IMetadataComponents";
import { ValidationPipe } from "typia/lib/typings/ValidationPipe";

import { IReflectImport } from "../structures/IReflectImport";
import { IReflectType } from "../structures/IReflectType";

export interface IOperationMetadata {
  parameters: IOperationMetadata.IParameter[];
  success: IOperationMetadata.IResponse;
  exceptions: IOperationMetadata.IResponse[];
  description: string | null;
  jsDocTags: IJsDocTagInfo[];
}
export namespace IOperationMetadata {
  export interface IParameter extends IResponse {
    name: string;
    index: number;
    description: string | null;
    jsDocTags: IJsDocTagInfo[];
  }
  export interface IResponse {
    type: IReflectType | null;
    imports: IReflectImport[];
    primitive: ValidationPipe<ISchema, IError>;
    resolved: ValidationPipe<ISchema, IError>;
  }
  export interface IException {
    type: IReflectType | null;
    imports: IReflectImport[];
    primitive: ValidationPipe<ISchema, IError>;
  }

  export interface ISchema {
    components: IMetadataComponents;
    metadata: IMetadata;
  }
  export interface IError {
    name: string;
    accessor: string | null;
    messages: string[];
  }
}
