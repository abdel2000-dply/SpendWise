/**
 * Cloud backup service using Supabase.
 *
 * Setup:
 * 1. Go to https://supabase.com and create a free project.
 * 2. In SQL Editor, run:
 *    create table backups (
 *      id uuid default gen_random_uuid() primary key,
 *      user_id text not null,
 *      data jsonb not null,
 *      created_at timestamptz default now()
 *    );
 *    -- Enable RLS and allow anonymous read/write:
 *    alter table backups enable row level security;
 *    create policy "allow select" on backups for select using (true);
 *    create policy "allow insert" on backups for insert with check (true);
 *    create policy "allow delete" on backups for delete using (true);
 * 3. Add to your .env file:
 *    EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
 *    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * 4. The `userId` is derived from a stable device identifier stored on first run.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isCloudBackupConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

interface BackupRecord {
  id: string;
  user_id: string;
  data: Record<string, unknown>;
  created_at: string;
}

/**
 * Upload a full data backup to Supabase.
 * Returns true on success, false on failure.
 */
export async function uploadBackup(
  data: Record<string, unknown>,
  userId: string,
): Promise<boolean> {
  if (!isCloudBackupConfigured()) return false;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/backups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ user_id: userId, data }),
    });

    if (!res.ok) {
      console.error(
        "[CloudBackup] Upload failed:",
        res.status,
        await res.text(),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[CloudBackup] Upload error:", err);
    return false;
  }
}

/**
 * Download the most recent backup for a userId.
 * Returns the parsed data object, or null if none found.
 */
export async function downloadLatestBackup(
  userId: string,
): Promise<Record<string, unknown> | null> {
  if (!isCloudBackupConfigured()) return null;

  try {
    const url =
      `${SUPABASE_URL}/rest/v1/backups` +
      `?user_id=eq.${encodeURIComponent(userId)}` +
      `&order=created_at.desc&limit=1&select=data,created_at`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      console.error("[CloudBackup] Download failed:", res.status);
      return null;
    }

    const rows: BackupRecord[] = await res.json();
    if (!rows.length) return null;
    return rows[0].data;
  } catch (err) {
    console.error("[CloudBackup] Download error:", err);
    return null;
  }
}

/**
 * Delete all backups older than 30 days for a user.
 * Call this after a successful upload to keep storage lean.
 */
export async function pruneOldBackups(userId: string): Promise<void> {
  if (!isCloudBackupConfigured()) return;

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/backups?user_id=eq.${encodeURIComponent(userId)}&created_at=lt.${cutoff}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );
  } catch {
    // prune failure is non-critical, ignore
  }
}
