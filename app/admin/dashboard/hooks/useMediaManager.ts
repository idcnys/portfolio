"use client";

import { useState } from "react";
import { CloudinaryImage } from "../../../../lib/types";
import {
  saveMediaRef,
  deleteMediaRef,
} from "../../../../lib/firebase";

type SetMessage = (msg: { text: string; type: string }) => void;

export function useMediaManager(setMessage: SetMessage) {
  const [media, setMedia] = useState<CloudinaryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const cloudinaryUploadPreset = "portfolio_preset";
  const cloudinaryCloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqhwfya3u";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      setMessage({
        text: "Cloudinary config missing. Check dashboard code.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.secure_url) {
        await saveMediaRef({
          url: data.secure_url,
          publicId: data.public_id,
          name: file.name,
          createdAt: new Date().toISOString(),
        });
        setMessage({ text: "Image uploaded successfully!", type: "success" });
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err: any) {
      setMessage({
        text: `Upload failed: ${err.message}`,
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  const handleDeleteMedia = async (image: CloudinaryImage) => {
    if (window.confirm(`Delete "${image.name}" from your records?`)) {
      try {
        await deleteMediaRef(image.id);
        setMessage({ text: "Image reference removed.", type: "success" });
      } catch (err) {
        setMessage({ text: "Error removing reference.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: "Link copied to clipboard!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  return {
    media,
    setMedia,
    isUploading,
    handleImageUpload,
    handleDeleteMedia,
    copyToClipboard,
  };
}
