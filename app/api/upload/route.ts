import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

/**
 * Simple file upload endpoint for return photos.
 * Stores files in /public/uploads/ directory.
 * 
 * For production, replace with cloud storage (S3, Cloudinary, etc.)
 * This works on Vercel with the /tmp directory for serverless functions,
 * but files won't persist across deployments. Use cloud storage in production.
 */
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file)
    return NextResponse.json({ error: "No file provided." }, { status: 400 });

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type))
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and HEIC images are allowed." },
      { status: 400 },
    );

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json(
      { error: "File size must be under 5MB." },
      { status: 400 },
    );

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const dir = join("/tmp", "uploads");
    await mkdir(dir, { recursive: true });
    const filepath = join(dir, filename);
    await writeFile(filepath, buffer);

    // For Vercel, files in /tmp won't persist. In production use Supabase Storage or S3.
    // Return a placeholder URL that the admin can access
    const url = `/api/upload/${filename}`;

    return NextResponse.json({ data: { url, filename } });
  } catch {
    return NextResponse.json(
      { error: "Upload failed." },
      { status: 500 },
    );
  }
}
