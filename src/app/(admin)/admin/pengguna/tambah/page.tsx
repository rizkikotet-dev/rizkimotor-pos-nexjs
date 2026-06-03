import { getCurrentUser } from "@/lib/auth";
import { UserForm } from "../UserForm";
import { createUser } from "../actions";

export const dynamic = "force-dynamic";

export default async function TambahPenggunaPage() {
  await getCurrentUser();
  return (
    <div className="page-container max-w-2xl pb-24 lg:pb-8">
      <h1 className="text-xl font-bold text-surface-900 mb-1">Tambah Pengguna</h1>
      <p className="text-sm text-surface-500 mb-6">Buat akun admin atau kasir baru</p>
      <UserForm action={createUser} isEdit={false} />
    </div>
  );
}
