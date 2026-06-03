import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { StrukView } from "./StrukView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function StrukPage({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) notFound();

  const [transaction, settings] = await Promise.all([
    prisma.transaction.findUnique({
      where: { id },
      include: { user: true, items: true },
    }),
    getSettings(),
  ]);
  if (!transaction) notFound();

  // Permission: KASIR hanya bisa lihat transaksinya sendiri
  if (user!.role !== "ADMIN" && transaction.userId !== parseInt(user!.id)) {
    notFound();
  }

  // Tentukan "kembali ke" URL
  const { from } = await searchParams;
  const backUrl = from === "admin" ? `/admin/transaksi/${id}` : "/pos/riwayat";

  // Serialisasi Date -> string untuk client component
  const tx = {
    ...transaction,
    createdAt: transaction.createdAt.toISOString(),
  };

  return <StrukView transaction={tx} settings={settings} backUrl={backUrl} />;
}
