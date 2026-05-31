"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ContextMenuPosition {
  x: number;
  y: number;
}

export default function CustomContextMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/bittosaha",
      icon: "/icons/icons8-linkedin-50.svg",
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      name: "GitHub",
      url: "https://github.com/idcnys",
      icon: "/icons/icons8-github-50.svg",
      color: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/idcnys",
      icon: "/icons/icons8-twitter-bird.svg",
      color: "hover:bg-sky-50 dark:hover:bg-sky-900/20",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/biiitto",
      icon: "/icons/icons8-facebook-50.svg",
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      name: "Email",
      url: "mailto:bittosaaha@gmail.com",
      icon: "/icons/icons8-gmail-50.svg",
      color: "hover:bg-red-50 dark:hover:bg-red-900/20",
    },
  ];

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  };

  const handleClick = () => {
    setIsVisible(false);
  };

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setIsVisible(false);
  };

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    document.addEventListener("scroll", handleClick);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("scroll", handleClick);
    };
  }, []);

  if (!isVisible) return null;

  // Adjust position if context menu would go off screen
  const adjustedX =
    position.x + 200 > window.innerWidth ? position.x - 200 : position.x;
  const adjustedY =
    position.y + socialLinks.length * 45 > window.innerHeight
      ? position.y - socialLinks.length * 45
      : position.y;

  return (
    <div
      className="custom-context-menu fixed z-50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 min-w-48"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-600">
        Connect with me
      </div>
      {socialLinks.map((social) => (
        <button
          key={social.name}
          onClick={() => handleSocialClick(social.url)}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors ${social.color}`}
        >
          <Image
            src={social.icon}
            alt={social.name}
            width={20}
            height={20}
            className="w-5 h-5 flex-shrink-0"
          />
          <span>{social.name}</span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            {social.name === "Email" ? "Send Email" : "Open Profile"}
          </span>
        </button>
      ))}

      {/* Separator */}
      <div className="border-b border-gray-100 dark:border-gray-600 my-1"></div>

      {/* Copy Portfolio Link */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setIsVisible(false);
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <span>Copy Portfolio Link</span>
      </button>
    </div>
  );
}
