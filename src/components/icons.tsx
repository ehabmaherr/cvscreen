import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconProjects(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" />
    </svg>
  );
}

export function IconFeedback(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M2 3.2h12v7.3H6.8L3.6 13V10.5H2z" />
    </svg>
  );
}

export function IconHistory(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8.3" r="6" />
      <path d="M8 5v3.3l2.3 1.4" />
      <path d="M8 1.2v1.6M5.3 1.7l.6 1.5" />
    </svg>
  );
}

export function IconMemory(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 2.2a2.3 2.3 0 0 0-2.3 2.3v.2A2.1 2.1 0 0 0 2 6.6v.4c0 .8.5 1.5 1.2 1.9-.2.3-.3.7-.3 1.1 0 1.3 1 2.3 2.3 2.3H6" />
      <path d="M10.5 2.2a2.3 2.3 0 0 1 2.3 2.3v.2A2.1 2.1 0 0 1 14 6.6v.4c0 .8-.5 1.5-1.2 1.9.2.3.3.7.3 1.1 0 1.3-1 2.3-2.3 2.3H10" />
      <path d="M6 2.6v10.8M10 2.6v10.8" />
    </svg>
  );
}

export function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8" r="2.1" />
      <path d="M8 1.8v1.7M8 12.5v1.7M14.2 8h-1.7M3.5 8H1.8M12.3 3.7l-1.2 1.2M4.9 11.1l-1.2 1.2M12.3 12.3l-1.2-1.2M4.9 4.9 3.7 3.7" />
    </svg>
  );
}

export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  );
}
