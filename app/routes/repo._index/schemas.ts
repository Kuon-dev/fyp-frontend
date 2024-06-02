import { z } from "zod";

export const ProjectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  tags: z.array(z.string()).optional(),
  price: z.number().optional(),
  visibility: z.enum(["public", "private"]),
  iframeSrc: z.string().url("Invalid URL").optional(),
});

export type ProjectFormData = z.infer<typeof ProjectFormSchema>;
