interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  ACTIVE: "badge-success",
  INACTIVE: "badge-neutral",
  PAID: "badge-success",
  UNPAID: "badge-danger",
  PENDING: "badge-warning",
  COMPLETED: "badge-success",
  CANCELLED: "badge-danger",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
  PAID: "Lunas",
  UNPAID: "Belum Bayar",
  PENDING: "Tertunda",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={statusStyles[status] || "badge-neutral"}
    >
      {statusLabels[status] || status}
    </span>
  );
}
