import { z } from "zod";

const EnvironmentVariables = z.object({
  TABLE_NAME: z.string(),
});

const parsedEnv = EnvironmentVariables.parse(process.env);

export default {
  tableName: parsedEnv.TABLE_NAME,
};
