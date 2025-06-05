import type { SVGProps } from "react";

interface PickaxeProps extends SVGProps<SVGSVGElement> {
  animate?: boolean;
}

export const Pickaxe = ({ animate = false, ...props }: PickaxeProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 122.49 122.88"
    width="1em"
    height="1em"
    style={{
      transformOrigin: "0% 100%",
      ...(animate && { animation: "pickaxeRotate 2s ease-in-out infinite" }),
      ...props.style,
    }}
    {...props}
  >
    <title>Pickaxe</title>
    <style>
      {`
        @keyframes pickaxeRotate {
          0% { transform: rotate(-20deg); }
          50% { transform: rotate(25deg); }
          100% { transform: rotate(-20deg); }
        }
      `}
    </style>
    <path
      d="M101.12 37.47c14.95 18.54 22.23 40.44 21.28 60.48-6.91-16.93-17.64-34.09-31.87-49.9l-4.77 4.77c-.54.54-1.42.54-1.96 0L68.72 37.75c-.54-.54-.54-1.42 0-1.96l4.63-4.63C57.16 17.12 39.68 6.67 22.54.2c20.2-1.52 42.5 5.45 61.44 20.33l2.09-2.09c.54-.54 1.42-.54 1.96 0l15.08 15.08c.54.54.54 1.42 0 1.96l-1.99 1.99zm-32.96 5.04 12.22 12.22-65.64 65.64c-3.36 3.36-8.86 3.36-12.22 0-3.36-3.36-3.36-8.86 0-12.22l65.64-65.64z"
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
      }}
    />
  </svg>
);
