import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserForm } from "../../UserForm";
import { updateUser } from "../../actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPenggunaPage({ params }: PageProps) {
  await getCurrentUser();
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) notFound();

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div className="page-container max-w-2xl pb-24 lg:pb-8">
      <h1 className="text-xl font-bold text-surface-900 mb-1">Edit Pengguna</h1>
      <p className="text-sm text-surface-500 mb-6">@{user.username}</p>
      <UserForm
        action={updateUser.bind(null, id)}
        isEdit={true}
        initial={{
          username: user.username,
          name: user.name,
          role: user.role,
          active: user.active,
        }}
      />
    </div>
  );
}
