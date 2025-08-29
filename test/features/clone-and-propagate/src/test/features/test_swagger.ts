import { TestValidator } from "@nestia/e2e";

export const test_swagger = async () => {
  const content = await import("../../../swagger.json");
  const route = content.paths["/users/{user_id}/user"].get;

  TestValidator.equals(
    "202",
    route.responses["202"].content["application/json"].schema.$ref,
    "#/components/schemas/IUser",
  );
};
