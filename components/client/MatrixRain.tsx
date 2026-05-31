"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '@/lib/context/ThemeContext';

interface MatrixRainProps {
    startDelayMs?: number;
    revealDirection?: "corner" | "ltr";
}

const MatrixRain: React.FC<MatrixRainProps> = ({ startDelayMs = 0, revealDirection = "corner" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { isDarkMode } = useTheme();
    const [isRevealed, setIsRevealed] = useState(startDelayMs === 0);

    useEffect(() => {
        setIsRevealed(startDelayMs === 0);

        const revealTimer = window.setTimeout(() => {
            setIsRevealed(true);
        }, startDelayMs);

        return () => {
            window.clearTimeout(revealTimer);
        };
    }, [startDelayMs]);

    useEffect(() => {
                if (!isRevealed) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1).map(() => Math.random() * height / 20);

        const chars = "font-playwriteEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~";

        let animationFrameId: number;
        let lastTime = 0;
        const fps = 18; // Slightly faster frame rate while keeping the laminar feel
        const interval = 1000 / fps;

        const draw = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(draw);

            const delta = timestamp - lastTime;
            if (delta < interval) return;

            lastTime = timestamp - (delta % interval);

            // Create the trailing effect by painting a semi-transparent version 
            // of the background color instead of clearing the screen
            ctx.fillStyle = isDarkMode ? 'rgba(3, 7, 18, 0.08)' : 'rgba(243, 244, 246, 0.15)';
            ctx.fillRect(0, 0, width, height);

            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                
                // Switch between dark gold and bright gold depending on theme
                ctx.fillStyle = isDarkMode 
                    ? 'rgba(255, 219, 20, 0.48)' // Softer gold for dark mode
                    : 'rgba(184, 134, 11, 0.6)'; // Solid bronze/gold for light mode
                
                ctx.fillText(char, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Recalculate columns on resize
            const newColumns = Math.floor(width / 20);
            if (newColumns > drops.length) {
                for (let i = drops.length; i < newColumns; i++) {
                    drops[i] = Math.random() * height / 20;
                }
            }
        };

        window.addEventListener('resize', handleResize);
        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]); // Re-run effect when theme changes to update color and blending

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${
                isRevealed ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
                opacity: isDarkMode ? 0.26 : 0.5,
                willChange: 'opacity',
            }}
        />
    );
};

export default MatrixRain;
