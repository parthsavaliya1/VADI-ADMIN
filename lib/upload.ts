type UploadFolder = "product" | "category" | "notification" | "banner";

export const uploadImageToSupabase = async (
  file: File,
  folder: UploadFolder = "product",
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data?.success || !data?.url) {
      throw new Error(
        data?.message || data?.error || data?.details || "Image upload failed",
      );
    }

    return data.url as string;
  } catch (error) {
    console.error("Bunny upload failed:", error);
    alert(
      error instanceof Error ? error.message : "Image upload failed. Try again.",
    );
    return null;
  }
};
