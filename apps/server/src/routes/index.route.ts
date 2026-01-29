import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib/create-app";
import { HTTP_STATUS } from "@/lib/http-status";
import { jsonContent } from "@/lib/openapi/helpers";
import { ok } from "@/lib/response";
import { createSuccessEnvelopeSchema } from "@/schemas/envelope.schema";

import packageJSON from "../../../../package.json" with { type: "json" };

const apiName = "API Template";

// API info response schema
const apiInfoSchema = z.object({
  name: z.string().openapi({ example: apiName }),
  version: z.string().openapi({ example: "0.1.0" }),
}).openapi("ApiInfo");

const apiInfoEnvelopeSchema = createSuccessEnvelopeSchema(apiInfoSchema, "ApiInfoEnvelope");

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HTTP_STATUS.OK]: jsonContent(
          apiInfoEnvelopeSchema,
          "API information envelope",
        ),
      },
    }),
    (c) => {
      return ok(c, {
        name: apiName,
        version: packageJSON.version ?? "0.1.0",
      });
    },
  );

export default router;
