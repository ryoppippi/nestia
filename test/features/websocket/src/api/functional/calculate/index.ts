/**
 * @packageDocumentation
 * @module api.functional.calculate
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
//================================================================
import type { IConnection } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";
import type { Driver, WebSocketAcceptor } from "tgrid";
import { WebSocketConnector } from "tgrid";
import type { Primitive, tags } from "typia";

import type { ICalcConfig } from "../../interfaces/ICalcConfig";
import type { ICalcEventListener } from "../../interfaces/ICalcEventListener";
import type { ICalcReferrer } from "../../interfaces/ICalcReferrer";
import type { ICompositeCalculator } from "../../interfaces/ICompositeCalculator";
import type { IScientificCalculator } from "../../interfaces/IScientificCalculator";
import type { ISimpleCalculator } from "../../interfaces/ISimpleCalculator";
import type { IStatisticsCalculator } from "../../interfaces/IStatisticsCalculator";

/**
 * Health check API (HTTP GET).
 * @controller CalculateController.health
 * @path GET /calculate/health
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function health(connection: IConnection): Promise<health.Output> {
  return PlainFetcher.fetch(connection, {
    ...health.METADATA,
    template: health.METADATA.path,
    path: health.path(),
  });
}
export namespace health {
  export type Output = Primitive<string>;

  export const METADATA = {
    method: "GET",
    path: "/calculate/health",
    request: null,
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: 200,
  } as const;

  export const path = () => "/calculate/health";
}

/**
 * Prepare a composite calculator.
 *
 * @controller CalculateController.composite
 * @path /calculate/composite/:id/:nickname
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function composite(
  connection: IConnection<composite.Header>,
  id: string & tags.Format<"uri">,
  nickname: string,
  query: composite.Query,
  provider: composite.Provider,
): Promise<composite.Output> {
  const connector: WebSocketConnector<
    composite.Header,
    composite.Provider,
    composite.Listener
  > = new WebSocketConnector(connection.headers ?? ({} as any), provider);
  await connector.connect(
    `${connection.host.endsWith("/") ? connection.host.substring(0, connection.host.length - 1) : connection.host}${composite.path(id, nickname, query)}`,
  );
  const driver: Driver<composite.Listener> = connector.getDriver();
  return {
    connector,
    driver,
  };
}
export namespace composite {
  export type Output = {
    connector: WebSocketConnector<Header, Provider, Listener>;
    driver: Driver<Listener>;
  };
  export type Header = ICalcConfig;
  export type Provider = ICalcEventListener;
  export type Listener = ICompositeCalculator;
  export type Query = ICalcReferrer;

  export const path = (
    id: string & tags.Format<"uri">,
    nickname: string,
    query: Query,
  ) => {
    const variables: URLSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query as any))
      if (undefined === value) continue;
      else if (Array.isArray(value))
        value.forEach((elem: any) => variables.append(key, String(elem)));
      else variables.set(key, String(value));
    const location: string = `/calculate/composite/${encodeURIComponent(id?.toString() ?? "null")}/${encodeURIComponent(nickname?.toString() ?? "null")}`;
    return 0 === variables.size
      ? location
      : `${location}?${variables.toString()}`;
  };
}

/**
 * Prepare a simple calculator.
 *
 * @controller CalculateController.simple
 * @path /calculate/simple
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function simple(
  connection: IConnection<simple.Header>,
  provider: simple.Provider,
): Promise<simple.Output> {
  const connector: WebSocketConnector<
    simple.Header,
    simple.Provider,
    simple.Listener
  > = new WebSocketConnector(connection.headers ?? ({} as any), provider);
  await connector.connect(
    `${connection.host.endsWith("/") ? connection.host.substring(0, connection.host.length - 1) : connection.host}${simple.path()}`,
  );
  const driver: Driver<simple.Listener> = connector.getDriver();
  return {
    connector,
    driver,
  };
}
export namespace simple {
  export type Output = {
    connector: WebSocketConnector<Header, Provider, Listener>;
    driver: Driver<Listener>;
  };
  export type Header = ICalcConfig;
  export type Provider = ICalcEventListener;
  export type Listener = ISimpleCalculator;

  export const path = () => "/calculate/simple";
}

/**
 * Prepare a scientific calculator.
 *
 * @controller CalculateController.scientific
 * @path /calculate/scientific
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function scientific(
  connection: IConnection<scientific.Header>,
  provider: scientific.Provider,
): Promise<scientific.Output> {
  const connector: WebSocketConnector<
    scientific.Header,
    scientific.Provider,
    scientific.Listener
  > = new WebSocketConnector(connection.headers ?? ({} as any), provider);
  await connector.connect(
    `${connection.host.endsWith("/") ? connection.host.substring(0, connection.host.length - 1) : connection.host}${scientific.path()}`,
  );
  const driver: Driver<scientific.Listener> = connector.getDriver();
  return {
    connector,
    driver,
  };
}
export namespace scientific {
  export type Output = {
    connector: WebSocketConnector<Header, Provider, Listener>;
    driver: Driver<Listener>;
  };
  export type Header = ICalcConfig;
  export type Provider = ICalcEventListener;
  export type Listener = IScientificCalculator;

  export const path = () => "/calculate/scientific";
}

/**
 * Prepare a statistics calculator.
 *
 * @controller CalculateController.statistics
 * @path /calculate/statistics
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function statistics(
  connection: IConnection<statistics.Header>,
  provider: statistics.Provider,
): Promise<statistics.Output> {
  const connector: WebSocketConnector<
    statistics.Header,
    statistics.Provider,
    statistics.Listener
  > = new WebSocketConnector(connection.headers ?? ({} as any), provider);
  await connector.connect(
    `${connection.host.endsWith("/") ? connection.host.substring(0, connection.host.length - 1) : connection.host}${statistics.path()}`,
  );
  const driver: Driver<statistics.Listener> = connector.getDriver();
  return {
    connector,
    driver,
  };
}
export namespace statistics {
  export type Output = {
    connector: WebSocketConnector<Header, Provider, Listener>;
    driver: Driver<Listener>;
  };
  export type Header = ICalcConfig;
  export type Provider = ICalcEventListener;
  export type Listener = IStatisticsCalculator;

  export const path = () => "/calculate/statistics";
}
