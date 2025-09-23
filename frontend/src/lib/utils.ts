import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UNKNOWN_RECORD_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/b/b6/12in-Vinyl-LP-Record-Angle.jpg";

export const millisToStr = (millis: number) => {
  const mydate = new Date(millis);
  const humandate = `${mydate.getUTCMinutes()}:${mydate.getUTCSeconds().toString().padStart(2, "0")}`;
  return humandate

}
