import typia from "typia";
import type { Primitive } from "typia";

import api from "../../../../api";
import type { IToken } from "../../../../api/structures/IToken";

export const test_api_security = async (connection: api.IConnection) => {
  const output: Primitive<IToken> = await api.functional.security(connection);
  typia.assert(output);
};
