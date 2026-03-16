import { addDays } from "./date";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "teacher_session";

export async function createTeacherSession(teacherId: string) {
  const token = crypto.randomUUID();
  const expiresAt = addDays(new Date(), 7);

  await prisma.teacherSession.create({
    data: {
      token,
      teacherId,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function getTeacherFromSessionToken(token?: string) {
  if (!token) return null;

  const session = await prisma.teacherSession.findUnique({
    where: { token },
    include: { teacher: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.teacherSession.delete({ where: { token } }).catch(() => null);
    return null;
  }

  return session.teacher;
}
