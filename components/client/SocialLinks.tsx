"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

const socialVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function SocialLinks() {
  const openSocial = (platform: string) => {
    const urls: Record<string, string> = {
      LinkedIn: "https://www.linkedin.com/in/bittosaha",
      GitHub: "https://github.com/idcnys",
      Twitter: "https://twitter.com/bittosaha21",
      Facebook: "https://www.facebook.com/biiitto",
      Email: "mailto:bittosaaha@gmail.com",
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
  };

  const socialLinks = [
    {
      platform: "LinkedIn",
      icon: "/icons/icons8-linkedin-50.svg",
      alt: "LinkedIn",
    },
    { platform: "GitHub", icon: "/icons/icons8-github-50.svg", alt: "GitHub" },
    {
      platform: "Twitter",
      icon: "/icons/icons8-twitter-bird.svg",
      alt: "Twitter",
    },
    {
      platform: "Facebook",
      icon: "/icons/icons8-facebook-50.svg",
      alt: "Facebook",
    },
    { platform: "Email", icon: "/icons/icons8-gmail-50.svg", alt: "Email" },
  ];

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-4 mb-2"
    >
      {socialLinks.map((social, index) => (
        <motion.li
          key={social.platform}
          variants={socialVariants}
          whileHover={{
            scale: 1.06,
            y: -2,
            transition: {
              duration: 0.2,
            },
          }}
          whileTap={{ scale: 0.9 }}
          onClick={() => openSocial(social.platform)}
          className="cursor-pointer"
        >
          <Image
            src={social.icon}
            alt={social.alt}
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
