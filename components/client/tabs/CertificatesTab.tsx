"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Certificate } from "../../../lib/types";
import { INITIAL_CERTIFICATES } from "../../../lib/constants";
import { containerVariants, cardVariants, certificateVariants } from "../../../lib/animations/variants";

interface CertificatesTabProps {
  onSelectCertificate: (cert: Certificate) => void;
}

const CertificatesTab: React.FC<CertificatesTabProps> = ({ onSelectCertificate }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Certificates & Achievements
        </h2>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-300">
          {INITIAL_CERTIFICATES.length} Total
        </span>
      </motion.div>
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        {INITIAL_CERTIFICATES.map((cert) => (
          <motion.div
            key={cert.id}
            variants={certificateVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            className="overflow-hidden rounded border border-gray-100 dark:border-gray-800 group cursor-pointer bg-gray-50 dark:bg-gray-800 transition-colors hover:border-[#FFDB14]"
            onClick={() => onSelectCertificate(cert)}
          >
            <Image
              src={cert.imageUrl}
              alt="Certificate"
              width={300}
              height={200}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
              loading="lazy"
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default CertificatesTab;
