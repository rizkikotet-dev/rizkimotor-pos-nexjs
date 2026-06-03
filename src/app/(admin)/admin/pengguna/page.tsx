import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { UserDeleteButton } from "./UserDeleteButton";
import { formatDate } from "@/lib/format";
import { Users as UsersIcon, Plus, Pencil, ShieldCheck, User as UserIcon, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserListPage() {
  const currentUser = (await getCurrentUser())!;
  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <AdminHeader user={currentUser} title="Pengguna" subtitle="Kelola admin & kasir" />

      <div className="page-container pb-24 lg:pb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-surface-500">{users.length} pengguna terdaftar</p>
          <Link href="/admin/pengguna/tambah" className="btn-primary text-sm">
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </Link>
        </div>

        <div className="card overflow-hidden">
          {users.length === 0 ? (
            <p className="p-12 text-center text-sm text-surface-500">Belum ada pengguna.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Role</th>
                    <th className="text-center px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider hidden sm:table-cell">Dibuat</th>
                    <th className="text-right px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((u) => {
                    const isSelf = u.id === parseInt(currentUser.id);
                    return (
                      <tr key={u.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="bg-surface-100 text-surface-600 rounded-xl h-9 w-9 flex items-center justify-center flex-shrink-0">
                              {u.role === "ADMIN" ? <ShieldCheck className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-surface-900 flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="badge-info text-[10px] px-1.5 py-0.5">Anda</span>
                                )}
                              </div>
                              <div className="text-xs text-surface-500 font-mono">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`badge ${u.role === "ADMIN" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {u.active ? (
                            <span className="badge-success">
                              <CheckCircle className="h-3 w-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="badge-neutral">
                              <XCircle className="h-3 w-3" />
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-surface-500 text-xs hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/admin/pengguna/${u.id}/edit`}
                              className="btn-ghost p-1.5 rounded-lg"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <UserDeleteButton id={u.id} name={u.name} isSelf={isSelf} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
