"use client";

import { useState, useEffect } from "react";

const TERMS = [
  "build",
  "innovate",
  "pitch",
  "deploy",
  "create",
  "hack",
  "prototype",
  "collaborate",
  "design",
  "launch",
];

export default function BackgroundText() {
  const [displayText, setDisplayText] = useState("");
  const [termIndex, setTermIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = TERMS[termIndex];

    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex <= currentWord.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, charIndex));
        setCharIndex((prev) => prev + 1);
      }, 150);
    } else if (isDeleting && charIndex >= 0) {
      // Backspacing
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, charIndex));
        setCharIndex((prev) => prev - 1);
      }, 100);
    } else if (charIndex > currentWord.length) {
      // Word fully typed → wait, then start deleting
      timeout = setTimeout(() => setIsDeleting(true), 1200);
    } else if (charIndex < 0) {
      // Word fully deleted → move to next word
      setIsDeleting(false);
      setCharIndex(0);
      setTermIndex((prev) => (prev + 1) % TERMS.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, termIndex]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <p className="text-[6rem] font-bold text-white/40 blur-sm tracking-wide uppercase">
        {displayText}
      </p>
    </div>
  );
}
