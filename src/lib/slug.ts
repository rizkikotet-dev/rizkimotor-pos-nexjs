// Slug generation — deduplicated from 4 places that did the same loop.

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

/**
 * Generate a unique slug for a category.
 * Appends -1, -2, etc. if base slug already exists.
 */
export async function generateUniqueSlug(
  name: string,
  excludeId?: number
): Promise<string> {
  let slug = slugify(name);
  let i = 1;

  if (excludeId) {
    while (await prisma.category.findFirst({ where: { slug, NOT: { id: excludeId } } })) {
      slug = `${slugify(name)}-${i++}`;
    }
  } else {
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${slugify(name)}-${i++}`;
    }
  }

  return slug;
}
