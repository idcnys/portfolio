import React from "react";
import Image from "next/image";

const LOADING_TEXTS = [
  "Forging brilliance...",
  "Summoning pixels...",
  "Awakening the canvas...",
  "Conjuring the portfolio...",
  "Aligning the stars...",
  "Mighty engines warming...",
  "Crafting the experience...",
  "Weaving the layout...",
  "Polishing the hero...",
  "Tempering the visuals...",
  "Calling the sprites...",
  "Beckoning the details...",
  "Preparing the showcase...",
  "Marshalling content...",
  "Summoning creative forces...",
  "Kindling the interface...",
  "Honing the layout...",
  "Mightily loading...",
  "Majestic assembly...",
  "Gathering artifacts...",
  "Forging the header...",
  "Stirring the matrix...",
  "Rousing the pixels...",
  "Summoning the hero...",
  "Aligning compositions...",
  "Shaping the narrative...",
  "Preparing the opus...",
  "Loading grandeur...",
  "Tuning the display...",
  "Loading with purpose...",
  "Marshalling visuals...",
  "Warming the stage...",
  "Molding the canvas...",
  "Gathering splendor...",
  "Assembling wonder...",
  "Brewing the layout...",
  "Summoning elegance...",
  "Forging wonderment...",
  "Invoking the experience...",
  "Waking the portfolio...",
  "Preparing majesty...",
  "Building the showcase...",
  "Wielding creative force...",
  "Sculpting the view...",
  "Gathering the gems...",
  "Orchestrating visuals...",
  "Calling forth content...",
  "Awakening artistry...",
  "Finalizing the spectacle...",
];


export default function PortfolioClientSSR() {

  let idx = Math.floor(Math.random() * LOADING_TEXTS.length);
  let heading = LOADING_TEXTS[idx];

  return (
    <div id="portfolio-ssr">
      <div className="min-h-screen md:h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row p-0 max-w-screen relative font-pixel">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FFDB14]/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5" />
        </div>

        <div className="flex-1 h-auto md:h-full flex flex-col min-w-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-none shadow-[0_12px_34px_rgba(15,23,42,0.07)] border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="w-full p-4 md:p-6">
            <div className="relative">
              {/* Placeholder for MatrixRain background (client will replace) */}
              <div className="absolute inset-0" aria-hidden />

              <section className="sticky top-0 min-h-screen flex flex-col justify-center py-20 px-4 bg-gray-100 dark:bg-gray-950 z-[1] overflow-hidden">
                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">

                  <div className="space-y-4">
                    <h1 className="text-3xl font-pixel md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {heading}
                    </h1>
                    <p className="text-gray-500 font-pixel dark:text-gray-400 text-sm font-medium">
                      Preparing content — this should be quick.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
