import {makeBadge, Format} from "badge-maker";
import {createHash} from "node:crypto";

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

export function geteTag(content: string) {
  const hash = createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
}
