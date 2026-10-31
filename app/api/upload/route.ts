import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PINATA_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files";
const IPFS_GATEWAY = "https://ipfs.io/ipfs";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

/**
 * Pins an image or a metadata JSON blob to IPFS via Pinata.
 *
 * The Pinata JWT stays server-side: the browser never sees it. A launch token's
 * metadata must live somewhere permanent, because if this route ever disappears
 * the coin's name and image vanish from wallets and DexScreener — a delisting rug.
 */
export async function POST(req: Request) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "PINATA_JWT is not configured on the server." },
      { status: 500 }
    );
  }

  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = incoming.get("file");
  const kind = String(incoming.get("kind") ?? "image");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing `file` field." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File exceeds ${MAX_BYTES / 1024 / 1024} MB limit.` },
      { status: 413 }
    );
  }
  if (kind === "image" && !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${file.type || "unknown"}.` },
      { status: 415 }
    );
  }

  const forwarded = new FormData();
  forwarded.append("network", "public");
  forwarded.append("file", file, file instanceof File ? file.name : `${kind}.bin`);

  let upstream: Response;
  try {
    upstream = await fetch(PINATA_UPLOAD_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: forwarded,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `IPFS upload failed: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Pinata rejected the upload (${upstream.status}).`, detail: detail.slice(0, 300) },
      { status: 502 }
    );
  }

  const payload = (await upstream.json()) as { data?: { cid?: string } };
  const cid = payload.data?.cid;
  if (!cid) {
    return NextResponse.json({ error: "Pinata response contained no CID." }, { status: 502 });
  }

  return NextResponse.json({ cid, url: `${IPFS_GATEWAY}/${cid}` });
}
