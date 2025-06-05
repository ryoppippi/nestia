import typia from "typia";

import api from "../../../../api";

export const test_api_health_get = async (connection: api.IConnection) => {
  const output = await api.functional.health.get(connection);
  typia.assert(output);
};
