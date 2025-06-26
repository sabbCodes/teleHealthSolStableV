import type { SVGProps } from "react";
import { Loader2 } from "lucide-react";

export const Icons = {
  spinner: Loader2,
  google: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      {...props}
    >
      <g>
        <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.1.9 7 2.4l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.2-2.5-.4-3.5z"/>
        <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.7 0 5.1.9 7 2.4l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.3 7.6 6.3 14.7z"/>
        <path fill="#FBBC05" d="M24 45c5.3 0 10.2-1.8 14-4.9l-6.5-5c-2 1.4-4.5 2.2-7.5 2.2-5.6 0-10.3-3.8-12-9l-6.6 5.1C9.3 40.4 16.3 45 24 45z"/>
        <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.3-6.3 6.7l6.5 5C41.7 36.2 45 31.7 45 24c0-1.4-.2-2.5-.4-3.5z"/>
      </g>
    </svg>
  ),
};
 