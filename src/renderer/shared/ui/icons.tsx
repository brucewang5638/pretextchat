import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function buildIconProps({
  size = 18,
  ...props
}: IconProps): SVGProps<SVGSVGElement> {
  return {
    ...props,
    width: props.width ?? size,
    height: props.height ?? size,
  };
}

export function CloseIcon(props: IconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 21l-6-6" />
      <path d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

interface PinIconProps extends IconProps {
  filled?: boolean;
}

export function PinIcon({ filled = false, ...props }: PinIconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      <path d="M12 17v5" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4v5h.582" />
      <path d="M19.938 11A8.001 8.001 0 0 0 4.582 9" />
      <path d="M4.582 9H9" />
      <path d="M20 20v-5h-.581" />
      <path d="M4.062 13A8.003 8.003 0 0 0 19.419 15" />
      <path d="M19.419 15H15" />
    </svg>
  );
}

export function SpinnerArcIcon(props: IconProps) {
  return (
    <svg
      {...buildIconProps(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
