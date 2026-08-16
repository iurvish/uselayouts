/** Path data exported from the useLayouts 2.0 Figma file, re-authored to take
 *  `currentColor` so the same glyph can render in active and idle states. */

type IconProps = React.SVGProps<SVGSVGElement>;

export function CanvasIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M8.33333 18.3333V5.83333C8.33333 5.61232 8.24554 5.40036 8.08926 5.24408C7.93297 5.0878 7.72101 5 7.5 5H3.33333C2.89131 5 2.46738 5.17559 2.15482 5.48816C1.84226 5.80072 1.66667 6.22464 1.66667 6.66667V16.6667C1.66667 17.1087 1.84226 17.5326 2.15482 17.8452C2.46738 18.1577 2.89131 18.3333 3.33333 18.3333H13.3333C13.7754 18.3333 14.1993 18.1577 14.5118 17.8452C14.8244 17.5326 15 17.1087 15 16.6667V12.5C15 12.279 14.9122 12.067 14.7559 11.9107C14.5996 11.7545 14.3877 11.6667 14.1667 11.6667H1.66667" />
      <path d="M17.5 1.66667H12.5C12.0398 1.66667 11.6667 2.03976 11.6667 2.5V7.5C11.6667 7.96024 12.0398 8.33333 12.5 8.33333H17.5C17.9602 8.33333 18.3333 7.96024 18.3333 7.5V2.5C18.3333 2.03976 17.9602 1.66667 17.5 1.66667Z" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z" />
      <path d="M17.5 7.5H2.5" />
      <path d="M17.5 12.5H2.5" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M14 14L10.3454 10.3454" />
      <path d="M6.88889 11.7778C9.58889 11.7778 11.7778 9.58889 11.7778 6.88889C11.7778 4.18889 9.58889 2 6.88889 2C4.18889 2 2 4.18889 2 6.88889C2 9.58889 4.18889 11.7778 6.88889 11.7778Z" />
    </svg>
  );
}
