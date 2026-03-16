import { z } from "zod";

export const teacherCreateSchema = z.object({
  name: z.string().min(2).max(80),
  subject: z.string().min(2).max(80),
  password: z.string().min(6).max(60),
});

export const teacherLoginSchema = z.object({
  slug: z.string().min(2),
  password: z.string().min(6).max(60),
});

const questionSchema = z.object({
  prompt: z.string().min(5).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(6),
  correctIndex: z.number().int().min(0).max(5),
});

export const testCreateSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  durationMinutes: z.number().int().min(5).max(180),
  questions: z.array(questionSchema).min(1).max(100),
});

export const attemptStartSchema = z.object({
  testId: z.string().min(2),
  studentName: z.string().min(2).max(80),
});

export const attemptSubmitSchema = z.object({
  attemptId: z.string().min(2),
  answers: z.array(
    z.object({
      questionId: z.string().min(2),
      optionId: z.string().min(2),
    })
  ),
});
