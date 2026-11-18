/**
 * The database returns at most 1,000 rows per request. This keeps asking for
 * the next page until everything is in, so lists, totals and backups are complete.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAll<T = any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>,
  size = 1000,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: T[]; error: any }> {
  const out: T[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await page(from, from + size - 1);
    if (error) return { data: out, error };
    out.push(...(data ?? []));
    if (!data || data.length < size) return { data: out, error: null };
  }
}
