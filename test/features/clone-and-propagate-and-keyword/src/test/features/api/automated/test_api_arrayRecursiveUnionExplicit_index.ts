import type { IPropagation } from "@nestia/fetcher";
import typia from "typia";

import api from "../../../../api";
import type { IDirectory } from "../../../../api/structures/IDirectory";
import type { IImageFile } from "../../../../api/structures/IImageFile";
import type { IShortcut } from "../../../../api/structures/IShortcut";
import type { ITextFile } from "../../../../api/structures/ITextFile";
import type { IZipFile } from "../../../../api/structures/IZipFile";

export const test_api_arrayRecursiveUnionExplicit_index = async (
  connection: api.IConnection,
) => {
  const output: IPropagation<
    {
      200: (IDirectory | IImageFile | ITextFile | IZipFile | IShortcut)[];
    },
    200
  > = await api.functional.arrayRecursiveUnionExplicit.index(connection);
  typia.assert(output);
};
