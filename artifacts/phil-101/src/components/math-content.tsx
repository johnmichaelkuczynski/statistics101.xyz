import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";

interface MathContentProps {
  text: string;
  className?: string;
}

export function MathContent({ text, className }: MathContentProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      renderMathInElement(ref.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    } catch {
      // KaTeX failures fall back to plain text — by design.
    }
  }, [text]);

  return (
    <div
      ref={ref}
      className={
        className ??
        "whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-stone-800"
      }
    >
      {text}
    </div>
  );
}
