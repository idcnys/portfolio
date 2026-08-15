"use client";

import React from "react";
import { Loader2, Image as ImageIcon, Link as LinkIcon, ExternalLink, Trash as TrashIcon } from "lucide-react";
import { CloudinaryImage } from "../../lib/types";

interface MediaTabProps {
  media: CloudinaryImage[];
  isUploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteMedia: (image: CloudinaryImage) => void;
  onCopyLink: (url: string) => void;
}

const MediaTab: React.FC<MediaTabProps> = ({
  media,
  isUploading,
  onImageUpload,
  onDeleteMedia,
  onCopyLink,
}) => {
  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter dark:text-gray-100">
              Media Library
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 dark:text-gray-500">
              Upload and manage images via Cloudinary
            </p>
          </div>

          <div className="relative group">
            <input
              type="file"
              id="imageUpload"
              className="hidden"
              onChange={onImageUpload}
              accept="image/*"
              disabled={isUploading}
            />
            <label
              htmlFor="imageUpload"
              className={`flex items-center gap-3 px-8 py-4 bg-[#FFDB14] text-gray-900 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-all cursor-pointer shadow-lg shadow-yellow-500/20 active:scale-95 ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
              {isUploading ? "Uploading..." : "Upload New Image"}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {media.map((image) => (
            <div
              key={image.id}
              className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all dark:bg-gray-900 dark:border-gray-800"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => onCopyLink(image.url)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-[#FFDB14] transition-colors"
                    title="Copy Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(image.url, "_blank")}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-[#FFDB14] transition-colors"
                    title="View Fullsize"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="font-bold text-sm text-gray-900 truncate dark:text-gray-100">
                  {image.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase dark:text-gray-500">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onDeleteMedia(image)}
                    className="text-red-500 hover:text-red-600 transition-colors p-2"
                    title="Delete Reference"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {media.length === 0 && !isUploading && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 dark:bg-gray-900/40 dark:border-gray-800">
              <ImageIcon className="w-10 h-10 text-gray-200 mb-4 block mx-auto" />
              <p className="text-gray-400 font-bold">No images uploaded yet</p>
              <p className="text-xs text-gray-400">
                Your media library is empty. Start by uploading an image.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaTab;
