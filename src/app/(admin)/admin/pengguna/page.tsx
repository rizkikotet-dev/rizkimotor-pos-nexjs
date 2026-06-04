import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { UserRole } from "@/lib/constants";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import { Plus, Pencil, Users } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function AdminPenggunaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const preserve = { pageSize: sp.pageSize };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.user.count(),
  ]);
  const pagination = buildPaginationMeta(page, pageSize, total);

  return (
    <div>
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Pengguna</h1>
            <p className="text-sm text-zinc-500 mt-0.5 font-mono">{total} pengguna terdaftar</p>
          </div>
          <Link href="/admin/pengguna/tambah" className="btn-primary">
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-outline-variant bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Nama</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Username</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Role</th>
                  <th className="px-4 py-3 text-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-outline-variant">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-4 py-3 text-zinc-200 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className={`tag ${user.role === UserRole.ADMIN ? "tag-brand" : "tag-dark"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={user.active ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/pengguna/${user.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition-colors p-1.5 rounded-md"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                      <Users className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                      Belum ada pengguna.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            basePath="/admin/pengguna"
            pageSize={pageSize}
            preserveParams={preserve}
          />
        </div>
      </FadeIn>
    </div>
  );
}
