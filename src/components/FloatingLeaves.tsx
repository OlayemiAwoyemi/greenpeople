import { useMemo } from "react";

const FloatingLeaves = () => {
  const leaves = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 15}s`,
        duration: `${12 + Math.random() * 10}s`,
        size: 14 + Math.random() * 18,
        opacity: 0.15 + Math.random() * 0.2,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute animate-float-leaf"
          style={{
            left: leaf.left,
            top: "-40px",
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            opacity: leaf.opacity,
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.16 20C12.53 20 17 14.5 17 8Z"
              fill="hsl(120 100% 20%)"
              opacity="0.6"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingLeaves;
