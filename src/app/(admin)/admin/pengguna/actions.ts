"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole, USER_ROLES } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createSchema = z.object({
  username: z.string().min(3, "Min 3 karakter").max(30).regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, underscore"),
  name: z.string().min(1, "Nama wajib diisi").max(100),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(USER_ROLES as unknown as [string, ...string[]]),
  active: z.coerce.boolean().default(true),
});

const updateSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().min(1).max(100),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(USER_ROLES as unknown as [string, ...string[]]),
  active: z.coerce.boolean(),
});

function parseFormCreate(formData: FormData) {
  return createSchema.parse({
    username: formData.get("username"),
    name: formData.get("name"),
    password: formData.get("password"),
    role: formData.get("role"),
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
}

function parseFormUpdate(formData: FormData) {
  return updateSchema.parse({
    username: formData.get("username"),
    name: formData.get("name"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
}

async function assertAdminAccess() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: ADMIN only");
  }
  return user;
}

export async function createUser(formData: FormData) {
  await assertAdminAccess();
  const data = parseFormCreate(formData);

  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) throw new Error(`Username "${data.username}" sudah digunakan.`);

  const hashed = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      username: data.username,
      name: data.name,
      password: hashed,
      role: data.role,
      active: data.active,
    },
  });

  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna");
}

export async function updateUser(id: number, formData: FormData) {
  const currentUser = await assertAdminAccess();
  const data = parseFormUpdate(formData);

  // Cegah admin nonaktifkan diri sendiri
  if (id === parseInt(currentUser.id) && !data.active) {
    throw new Error("Anda tidak dapat menonaktifkan akun sendiri.");
  }
  // Cegah admin turunkan role diri sendiri
  if (id === parseInt(currentUser.id) && data.role !== UserRole.ADMIN) {
    throw new Error("Anda tidak dapat mengubah role akun sendiri.");
  }

  const existing = await prisma.user.findFirst({ where: { username: data.username, NOT: { id } } });
  if (existing) throw new Error(`Username "${data.username}" sudah digunakan.`);

  const updateData: { username: string; name: string; role: string; active: boolean; password?: string } = {
    username: data.username,
    name: data.name,
    role: data.role,
    active: data.active,
  };
  if (data.password && data.password.length > 0) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({ where: { id }, data: updateData });

  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna");
}
