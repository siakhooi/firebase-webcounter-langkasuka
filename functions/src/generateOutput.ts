import {makeBadge, Format} from "badge-maker";


export function createBadge(count: number) {
  const format: Format = {
    label: "Visitor",
    message: String(count),
    color: "brightgreen",
    labelColor: "grey",
    style: "plastic",
  };
  return makeBadge(format);
}


export function createText(count: number) {
  return String(count);
}
