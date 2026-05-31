"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const CertificateDetailView: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
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
          <motion.div
            className="w-full h-auto min-h-[400px] relative rounded-lg shadow-lg overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={imageUrl}
              alt="Certificate"
              width={1600}
              height={1200}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CertificateDetailView;
