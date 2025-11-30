import {describe, test, expect} from "@jest/globals";
import {validateParameters} from "../validateParameters.js";

describe("validateParameters", () => {
  describe("counterId validation", () => {
    test.each([
      ["empty string", ""],
      ["undefined", undefined as any],
      ["null", null as any],
    ])("should return error when counterId is %s", (_description, counterId) => {
      const result = validateParameters(counterId, "text");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter counter is not defined!",
      });
    });
  });

  describe("outputType validation", () => {
    describe("not defined", () => {
      test.each([
        ["empty string", ""],
        ["undefined", undefined as any],
        ["null", null as any],
      ])("should return error when outputType is %s", (_description, outputType) => {
        const result = validateParameters("counter123", outputType);
        expect(result).toEqual({
          status: false,
          code: 400,
          message: "parameter outputtype is not defined!",
        });
      });
    });

    describe("not supported", () => {
      test.each([
        ["invalid (json)", "json"],
        ["xml", "xml"],
        ["incorrect case", "TEXT"],
        ["spaces", " text "],
      ])("should return error when outputType is %s", (_description, outputType) => {
        const result = validateParameters("counter123", outputType);
        expect(result).toEqual({
          status: false,
          code: 400,
          message: `parameter outputtype is not supported! (found ${outputType})`,
        });
      });
    });
  });

  describe("valid parameters", () => {
    test.each([
      ["text", "counter123", "text"],
      ["badge", "counter123", "badge"],
      ["javascript", "counter123", "javascript"],
      ["special characters in counterId", "counter-123_abc", "text"],
      ["long counterId", "a".repeat(1000), "badge"],
    ])("should return success for %s", (_description, counterId, outputType) => {
      const result = validateParameters(counterId, outputType);
      expect(result).toEqual({
        status: true,
        code: 200,
        message: "OK",
      });
    });
  });

  describe("edge cases", () => {
    test.each([
      [
        "prioritize counterId validation over outputType validation",
        "",
        "",
        "parameter counter is not defined!",
      ],
      [
        "check outputType validation when counterId is valid but outputType is empty",
        "counter123",
        "",
        "parameter outputtype is not defined!",
      ],
      [
        "validate outputType value after checking if it's defined",
        "counter123",
        "invalid",
        "parameter outputtype is not supported! (found invalid)",
      ],
    ])("should %s", (_description, counterId, outputType, expectedMessage) => {
      const result = validateParameters(counterId, outputType);
      expect(result).toEqual({
        status: false,
        code: 400,
        message: expectedMessage,
      });
    });
  });

  describe("return value structure", () => {
    test("should always return an object with status, code, and message properties", () => {
      const result = validateParameters("counter123", "text");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("message");
    });

    test.each([
      ["error", "", false],
      ["success", "counter123", true],
    ])("should return boolean status for %s cases", (_description, counterId, expectedStatus) => {
      const result = validateParameters(counterId, "text");
      expect(typeof result.status).toBe("boolean");
      expect(result.status).toBe(expectedStatus);
    });

    test.each([
      ["code", "code", "number"],
      ["message", "message", "string"],
    ])("should return %s %s for all cases", (_description, property, expectedType) => {
      const errorResult = validateParameters("", "text");
      const successResult = validateParameters("counter123", "text");
      expect(typeof errorResult[property as keyof typeof errorResult]).toBe(expectedType);
      expect(typeof successResult[property as keyof typeof successResult]).toBe(expectedType);
    });
  });
});
