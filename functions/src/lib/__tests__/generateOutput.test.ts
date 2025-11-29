import {describe, test, expect} from "@jest/globals";
import {getOutput, getContentType, geteTag} from "../generateOutput.js";
import {JAVASCRIPT_VARIABLE} from "../../web-counter-config.js";

describe("generateOutput", () => {
  describe("getOutput", () => {
    describe("text output type", () => {
      test("should return count as string for text output type", () => {
        const result = getOutput("text", 42);
        expect(result).toBe("42");
      });

      test("should handle zero count", () => {
        const result = getOutput("text", 0);
        expect(result).toBe("0");
      });

      test("should handle large numbers", () => {
        const result = getOutput("text", 999999);
        expect(result).toBe("999999");
      });

      test("should handle negative numbers", () => {
        const result = getOutput("text", -5);
        expect(result).toBe("-5");
      });
    });

    describe("badge output type", () => {
      test("should return SVG badge for badge output type", () => {
        const result = getOutput("badge", 100);
        expect(result).toContain("<svg");
        expect(result).toContain("</svg>");
        expect(result).toContain("100");
      });

      test("should return SVG for zero count", () => {
        const result = getOutput("badge", 0);
        expect(result).toContain("<svg");
        expect(result).toContain("</svg>");
        expect(result).toContain("0");
      });

      test("should return SVG for large numbers", () => {
        const result = getOutput("badge", 1000000);
        expect(result).toContain("<svg");
        expect(result).toContain("</svg>");
        expect(result).toContain("1000000");
      });

      test("should return SVG for negative numbers", () => {
        const result = getOutput("badge", -5);
        expect(result).toContain("<svg");
        expect(result).toContain("</svg>");
        expect(result).toContain("-5");
      });

      test("should return different SVG for different counts", () => {
        const result1 = getOutput("badge", 100);
        const result2 = getOutput("badge", 200);
        expect(result1).not.toBe(result2);
      });
    });

    describe("javascript output type", () => {
      test("should return javascript variable declaration", () => {
        const result = getOutput("javascript", 42);
        expect(result).toBe(`var ${JAVASCRIPT_VARIABLE}={count: 42}`);
      });

      test("should handle zero count in javascript", () => {
        const result = getOutput("javascript", 0);
        expect(result).toBe(`var ${JAVASCRIPT_VARIABLE}={count: 0}`);
      });

      test("should handle large numbers in javascript", () => {
        const result = getOutput("javascript", 999999);
        expect(result).toBe(`var ${JAVASCRIPT_VARIABLE}={count: 999999}`);
      });

      test("should use correct variable name from config", () => {
        const result = getOutput("javascript", 123);
        expect(result).toContain(JAVASCRIPT_VARIABLE);
        expect(result).toContain("var ");
        expect(result).toContain("={count: 123}");
      });
    });

    describe("invalid output type", () => {
      test("should return error message for invalid output type", () => {
        const result = getOutput("json", 42);
        expect(result).toBe("Error getOutput: invalid outputtype");
      });

      test("should return error message for empty string output type", () => {
        const result = getOutput("", 42);
        expect(result).toBe("Error getOutput: invalid outputtype");
      });

      test("should return error message for xml output type", () => {
        const result = getOutput("xml", 42);
        expect(result).toBe("Error getOutput: invalid outputtype");
      });

      test("should return error message for uppercase output type", () => {
        const result = getOutput("TEXT", 42);
        expect(result).toBe("Error getOutput: invalid outputtype");
      });

      test("should return error message for undefined output type", () => {
        const result = getOutput(undefined as any, 42);
        expect(result).toBe("Error getOutput: invalid outputtype");
      });

      test("should return error message for null output type", () => {
        const result = getOutput(null as any, 42);
        expect(result).toBe("Error getOutput: invalid outputtype");
      });
    });
  });

  describe("getContentType", () => {
    describe("valid content types", () => {
      test("should return 'text/plain' for text output type", () => {
        const result = getContentType("text");
        expect(result).toBe("text/plain");
      });

      test("should return 'image/svg+xml' for badge output type", () => {
        const result = getContentType("badge");
        expect(result).toBe("image/svg+xml");
      });

      test("should return 'application/javascript' for javascript output type", () => {
        const result = getContentType("javascript");
        expect(result).toBe("application/javascript");
      });
    });

    describe("invalid content types", () => {
      test("should return error message for invalid output type", () => {
        const result = getContentType("json");
        expect(result).toBe("Error getContentType: invalid outputtype");
      });

      test("should return error message for empty string output type", () => {
        const result = getContentType("");
        expect(result).toBe("Error getContentType: invalid outputtype");
      });

      test("should return error message for xml output type", () => {
        const result = getContentType("xml");
        expect(result).toBe("Error getContentType: invalid outputtype");
      });

      test("should return error message for uppercase output type", () => {
        const result = getContentType("BADGE");
        expect(result).toBe("Error getContentType: invalid outputtype");
      });

      test("should return error message for undefined output type", () => {
        const result = getContentType(undefined as any);
        expect(result).toBe("Error getContentType: invalid outputtype");
      });

      test("should return error message for null output type", () => {
        const result = getContentType(null as any);
        expect(result).toBe("Error getContentType: invalid outputtype");
      });
    });
  });

  describe("geteTag", () => {
    test("should return a hex string for valid content", () => {
      const result = geteTag("test content");
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should return different hash for different content", () => {
      const hash1 = geteTag("content1");
      const hash2 = geteTag("content2");
      expect(hash1).not.toBe(hash2);
    });

    test("should return same hash for same content", () => {
      const hash1 = geteTag("same content");
      const hash2 = geteTag("same content");
      expect(hash1).toBe(hash2);
    });

    test("should handle empty string", () => {
      const result = geteTag("");
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should handle long content", () => {
      const longContent = "a".repeat(10000);
      const result = geteTag(longContent);
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should handle special characters", () => {
      const result = geteTag("!@#$%^&*()_+-=[]{}|;:,.<>?/~`");
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should handle unicode characters", () => {
      const result = geteTag("Hello 世界 🌍");
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should return SHA256 hash length (64 hex characters)", () => {
      const result = geteTag("test");
      expect(result.length).toBe(64);
    });

    test("should generate consistent hash for SVG badge content", () => {
      const svgContent = "<svg xmlns=\"http://www.w3.org/2000/svg\">badge</svg>";
      const hash1 = geteTag(svgContent);
      const hash2 = geteTag(svgContent);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should generate consistent hash for javascript content", () => {
      const jsContent = `var ${JAVASCRIPT_VARIABLE}={count: 42}`;
      const hash1 = geteTag(jsContent);
      const hash2 = geteTag(jsContent);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("integration tests", () => {
    test("should generate output and content type for text", () => {
      const output = getOutput("text", 100);
      const contentType = getContentType("text");

      expect(output).toBe("100");
      expect(contentType).toBe("text/plain");
    });

    test("should generate output and content type for badge", () => {
      const output = getOutput("badge", 100);
      const contentType = getContentType("badge");

      expect(output).toContain("svg");
      expect(contentType).toBe("image/svg+xml");
    });

    test("should generate output and content type for javascript", () => {
      const output = getOutput("javascript", 100);
      const contentType = getContentType("javascript");

      expect(output).toContain(JAVASCRIPT_VARIABLE);
      expect(output).toContain("100");
      expect(contentType).toBe("application/javascript");
    });

    test("should generate etag for text output", () => {
      const output = getOutput("text", 100);
      const etag = geteTag(output);

      expect(etag).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should generate etag for badge output", () => {
      const output = getOutput("badge", 100);
      const etag = geteTag(output);

      expect(etag).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should generate etag for javascript output", () => {
      const output = getOutput("javascript", 100);
      const etag = geteTag(output);

      expect(etag).toMatch(/^[a-f0-9]{64}$/);
    });

    test("different counts should generate different etags for same output type", () => {
      const output1 = getOutput("text", 100);
      const output2 = getOutput("text", 200);
      const etag1 = geteTag(output1);
      const etag2 = geteTag(output2);

      expect(etag1).not.toBe(etag2);
    });
  });
});
