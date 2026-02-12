export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center w-full transition-all duration-700 fade-in">
      <div
        className="text-lg font-medium transition-colors duration-700"
        style={{
          color: "var(--loading-gear-color, #263238)",
        }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: "var(--loading-gear-color, #263238)",
              borderTopColor: "transparent",
            }}
          />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
}
