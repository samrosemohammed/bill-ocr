import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Never trust the original filename: generate your own
  const ext = path.extname(file.name).toLowerCase() || ".png";
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "upload-file");
  await mkdir(uploadDir, { recursive: true }); // creates folder if missing
  await writeFile(path.join(uploadDir, fileName), buffer);

  return NextResponse.json({
    message: "Uploaded",
    url: `/upload-file/${fileName}`,
  });
};
