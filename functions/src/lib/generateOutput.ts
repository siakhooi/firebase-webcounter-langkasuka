import {makeBadge, Format} from "badge-maker";
import {createHash} from "node:crypto";
import {JAVASCRIPT_VARIABLE} from "../web-counter-config.js";

function createBadge(count: number) {
  const format: Format = {
    label: "Visitor",
    message: String(count),
    color: "brightgreen",
    labelColor: "grey",
    style: "plastic",
  };
  return makeBadge(format);
}


function createJavascript(count: number) {
  return "var " + JAVASCRIPT_VARIABLE + "={count: " + count + "}";
}

export function getOutput(outputType: string, count: number): string {
  if (outputType === "text") return String(count);
  else if (outputType === "badge") return createBadge(count);
  else if (outputType === "javascript") return createJavascript(count);

  return "Error getOutput: invalid outputtype";
}

export function getContentType(outputType: string): string {
  if (outputType === "text") return "text/plain";
  else if (outputType === "badge") return "image/svg+xml";
  else if (outputType === "javascript") return "application/javascript";

  return "Error getContentType: invalid outputtype";
}

export function geteTag(content: string) {
  const hash = createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
}
