import { supabase } from "@/lib/supabase";

export const uploadImageToSupabase = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("VADI") // your bucket name
    .upload(`products/${fileName}`, file);

  if (error) {
    alert("Image upload failed");
    console.error(error);
    return null;
  }

  const { data } = supabase.storage
    .from("VADI")
    .getPublicUrl(`products/${fileName}`);

  return data.publicUrl;
};
