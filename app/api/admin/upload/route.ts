import { NextResponse } from "next/server";

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");

const getStorageHost = () => {
  const region = process.env.BUNNY_STORAGE_REGION?.trim();
  return region
    ? `https://${region}.storage.bunnycdn.com`
    : "https://storage.bunnycdn.com";
};

const normalizePathPrefix = (path: string) =>
  path
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");

const folderToPrefix: Record<string, string> = {
  product: "product",
  category: "category",
  notification: "notification",
  banner: "banner",
};

export async function POST(request: Request) {
  try {
    const storageZone = process.env.BUNNY_STORAGE_ZONE;
    const accessKey = process.env.BUNNY_API_KEY;
    const cdnBaseUrl = process.env.BUNNY_CDN_BASE_URL;

    if (!storageZone || !accessKey || !cdnBaseUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bunny CDN is not configured. Set BUNNY_STORAGE_ZONE, BUNNY_API_KEY and BUNNY_CDN_BASE_URL.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "product").toLowerCase();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Image file is required" },
        { status: 400 },
      );
    }

    const ext = file.name.includes(".")
      ? file.name.split(".").pop()?.toLowerCase()
      : "jpg";
    const safeName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, ""));
    const fileName = `${Date.now()}-${safeName}.${ext || "jpg"}`;
    const rootPrefix = normalizePathPrefix(
      process.env.BUNNY_UPLOAD_PREFIX || "vadi-app",
    );
    const folderName = folderToPrefix[folder] || folderToPrefix.product;
    const baseFolder = normalizePathPrefix(`${rootPrefix}/${folderName}`);
    const objectPath = `${baseFolder}/${fileName}`;
    const uploadUrl = `${getStorageHost()}/${storageZone}/${objectPath}`;

    const arrayBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: accessKey,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: Buffer.from(arrayBuffer),
    });

    if (!uploadResponse.ok) {
      const details = await uploadResponse.text();
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload image to Bunny storage",
          details,
        },
        { status: 502 },
      );
    }

    const cleanBase = cdnBaseUrl.replace(/\/+$/, "");
    const publicUrl = `${cleanBase}/${objectPath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error while uploading image",
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
