"use client";

export default function ActionButtons() {
  const handleScheduleTalk = () => {
    // @ts-ignore - Cal is added globally in layout.tsx
    if (window.Cal && window.Cal.ns && window.Cal.ns["quick-meet"]) {
      // @ts-ignore
      window.Cal.ns["quick-meet"]("modal", {
        calLink: "bittosaha/quick-meet",
        config: { layout: "month_view" },
      });
    } else {
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
