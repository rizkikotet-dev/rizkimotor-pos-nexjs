import { prisma } from "./prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * Cek apakah aplikasi perlu setup awal (database belum diinisialisasi
 * atau belum memiliki user).
 *
 * Return: true jika perlu setup, false jika sudah siap.
 */
export async function checkNeedsSetup(): Promise<boolean> {
  try {
    const count = await prisma.user.count();
    return count === 0;
  } catch (e) {
    // P2021 = tabel belum ada (database belum di push)
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2021") {
      return true;
    }
    // Error lain — lempar, jangan silent
    throw e;
  }
}

export { PrismaClientKnownRequestError };
