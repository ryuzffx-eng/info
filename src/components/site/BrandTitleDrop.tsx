interface BrandTitleDropProps {
  text: string;
  className?: string;
}

export function BrandTitleDrop({ text, className }: BrandTitleDropProps) {
  return (
    <span className={className}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="char-drop"
          style={{
            animationDelay: `${0.18 + index * 0.07}s`,
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
