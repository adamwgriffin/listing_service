import { z } from "zod";

export const serviceErrorSchema = z.object({
  message: z.string(),
  field: z.string().optional()
});

export const errorResponseSchema = z.object({
  errors: z.array(serviceErrorSchema)
});

export type ServiceError = z.infer<typeof serviceErrorSchema>;

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
