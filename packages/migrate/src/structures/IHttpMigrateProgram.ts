import { OpenApi } from "@samchon/openapi";

import { IHttpMigrateRoute } from "./IHttpMigrateRoute";

export interface IHttpMigrateProgram extends IHttpMigrateProgram.IProps {
  routes: IHttpMigrateRoute[];
  errors: IHttpMigrateProgram.IError[];
}
export namespace IHttpMigrateProgram {
  export interface IProps {
    mode: "nest" | "sdk";
    simulate: boolean;
    e2e: boolean;
    document: OpenApi.IDocument;
    author?: {
      tag: string;
      value: string;
    };
  }
  export interface IConfig {
    mode: "nest" | "sdk";
    simulate: boolean;
    e2e: boolean;
    author?: {
      tag: string;
      value: string;
    };
  }
  export interface IError {
    method: string;
    path: string;
    operation: () => OpenApi.IOperation;
    messages: string[];
  }
}
