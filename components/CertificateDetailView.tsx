"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const CertificateDetailView: React.FC<{
  imageUrl: string;
  duration?: string;
  topics?: string;
  issuer?: string;
  onlineUrl?: string;
}> = ({ imageUrl, duration, topics, issuer, onlineUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="h-full flex flex-col"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
        className="flex-1 p-4 md:p-6 flex items-center justify-center"
      >
        <div className="w-full max-w-4xl">
          <p className="p-2 mb-5">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugit facilis, libero recusandae error fuga id quo totam necessitatibus officia esse optio facere impedit voluptate possimus eos, nulla corrupti consequuntur assumenda ab itaque.</p>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 p-4">
              <p className="text-xs  text-gray-500 dark:text-gray-400 mb-2">Course duration</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{duration ?? "N/A"}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 p-4">
              <p className="text-xs  text-gray-500 dark:text-gray-400 mb-2">Topics</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{topics ?? "N/A"}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 p-4">
              <p className="text-xs  text-gray-500 dark:text-gray-400 mb-2">Issuer</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{issuer ?? "N/A"}</p>
            </div>
          </div>
          <Link href={onlineUrl ?? "#"} className=" text-[#00f] underline">Check Online Certification Id</Link>
          <motion.div
            className="mt-10 min-w-[250px] h-auto min-h-[400px] relative rounded-lg shadow-lg overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Certificate"
                width={1600}
                height={1200}
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Certificate image unavailable
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CertificateDetailView;
