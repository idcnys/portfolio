"use client";

import { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";

export default function ActionButtons() {
  const [calLoaded, setCalLoaded] = useState(false);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      setCalLoaded(true);
    })();
  }, []);

  const handleScheduleTalk = () => {
    if (calLoaded) {
      // Use the Cal API to open the modal
      getCalApi().then((cal) => {
        cal("modal", {
          calLink: "bittosaha/quick-meet",
        });
      });
    } else {
      // Fallback to direct link if Cal hasn't loaded yet
      window.open("https://cal.com/bittosaha/quick-meet", "_blank");
    }
  };

  const handleResumeDownload = () => {
    const link = document.createElement("a");
    link.href = "/cv.pdf";
    link.download = "Resume.pdf";
    link.click();
  };

  return (
    <div className="flex gap-2 mt-8">
      <button
        onClick={handleScheduleTalk}
        className="flex-1 bg-gray-900 dark:bg-gray-800 text-white py-2.5 px-3 rounded text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-700 transition-all shadow-sm"
      >
        <i className="fas fa-calendar-alt text-xs"></i> Schedule Talk
      </button>
      <button
        onClick={handleResumeDownload}
        className="flex-1 bg-[#FFDB14] text-gray-900 py-2.5 px-3 rounded text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#e6c512] transition-all shadow-sm"
      >
        <i className="fas fa-file-alt text-xs"></i> Resume
      </button>
    </div>
  );
}
