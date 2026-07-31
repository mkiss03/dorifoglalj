import Image from "next/image";
import { clsx } from "clsx";

export function Collage({
  image,
  alt,
  letter = "I",
  className,
}: {
  image: string;
  alt: string;
  letter?: string;
  className?: string;
}) {
  return (
    <div className={clsx("relative", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute -left-6 -top-14 select-none font-display text-[11rem] leading-none text-paper-alt"
      >
        {letter}
      </span>

      <div aria-hidden className="absolute right-2 top-8 h-64 w-52 rounded-2xl bg-panel" />

      <div className="relative ml-10 mt-14 h-80 w-64 overflow-hidden rounded-2xl shadow-card">
        <Image src={image} alt={alt} fill sizes="256px" className="photo-collage object-cover" />
      </div>

      <svg aria-hidden viewBox="0 0 200 60" className="absolute -bottom-3 left-6 h-14 w-48 text-accent-dark">
        <path
          d="M4,40 C40,10 80,55 120,25 C150,3 170,30 196,15"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
