const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  sliders: "M4 7h16M4 17h16M8 4v6M16 14v6",
  chevron: "m6 9 6 6 6-6",
  briefcase: "M3 7h18v14H3V7ZM8 7V3h8v4M3 12h18M10 12v3h4v-3",
  external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
};

export default function Icon({ name, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
