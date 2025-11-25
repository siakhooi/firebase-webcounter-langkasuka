import {describe, test, expect} from "@jest/globals";
import {validateParameters} from "../validateParameters.js";

describe("validateParameters", () => {
  describe("counterId validation", () => {
    test("should return error when counterId is empty string", () => {
      const result = validateParameters("", "text");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter counter is not defined!",
      });
    });

    test("should return error when counterId is undefined", () => {
      const result = validateParameters(undefined as any, "text");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter counter is not defined!",
      });
    });

    test("should return error when counterId is null", () => {
      const result = validateParameters(null as any, "text");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter counter is not defined!",
      });
    });
  });

  describe("outputType validation", () => {
    test("should return error when outputType is empty string", () => {
      const result = validateParameters("counter123", "");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not defined!",
      });
    });

    test("should return error when outputType is undefined", () => {
      const result = validateParameters("counter123", undefined as any);
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not defined!",
      });
    });

    test("should return error when outputType is null", () => {
      const result = validateParameters("counter123", null as any);
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not defined!",
      });
    });

    test("should return error when outputType is invalid", () => {
      const result = validateParameters("counter123", "json");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not supported! (found json)",
      });
    });

    test("should return error when outputType is xml", () => {
      const result = validateParameters("counter123", "xml");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not supported! (found xml)",
      });
    });

    test("should return error when outputType has incorrect case", () => {
      const result = validateParameters("counter123", "TEXT");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not supported! (found TEXT)",
      });
    });

    test("should return error when outputType has spaces", () => {
      const result = validateParameters("counter123", " text ");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not supported! (found  text )",
      });
    });
  });

  describe("valid parameters", () => {
    test("should return success when both parameters are valid with outputType 'text'", () => {
      const result = validateParameters("counter123", "text");
      expect(result).toEqual({
        status: true,
        code: 200,
        message: "OK",
      });
    });

    test("should return success when both parameters are valid with outputType 'badge'", () => {
      const result = validateParameters("counter123", "badge");
      expect(result).toEqual({
        status: true,
        code: 200,
        message: "OK",
      });
    });

    test("should return success when both parameters are valid with outputType 'javascript'", () => {
      const result = validateParameters("counter123", "javascript");
      expect(result).toEqual({
        status: true,
        code: 200,
        message: "OK",
      });
    });

    test("should return success with special characters in counterId", () => {
      const result = validateParameters("counter-123_abc", "text");
      expect(result).toEqual({
        status: true,
        code: 200,
        message: "OK",
      });
    });

    test("should return success with long counterId", () => {
      const longId = "a".repeat(1000);
      const result = validateParameters(longId, "badge");
      expect(result).toEqual({
        status: true,
        code: 200,
        message: "OK",
      });
    });
  });

  describe("edge cases", () => {
    test("should prioritize counterId validation over outputType validation", () => {
      const result = validateParameters("", "");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter counter is not defined!",
      });
    });

    test("should check outputType validation when counterId is valid but outputType is empty", () => {
      const result = validateParameters("counter123", "");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not defined!",
      });
    });

    test("should validate outputType value after checking if it's defined", () => {
      const result = validateParameters("counter123", "invalid");
      expect(result).toEqual({
        status: false,
        code: 400,
        message: "parameter outputtype is not supported! (found invalid)",
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

    test("should return boolean status for error cases", () => {
      const result = validateParameters("", "text");
      expect(typeof result.status).toBe("boolean");
      expect(result.status).toBe(false);
    });

    test("should return boolean status for success cases", () => {
      const result = validateParameters("counter123", "text");
      expect(typeof result.status).toBe("boolean");
      expect(result.status).toBe(true);
    });

    test("should return number code for all cases", () => {
      const errorResult = validateParameters("", "text");
      const successResult = validateParameters("counter123", "text");
      expect(typeof errorResult.code).toBe("number");
      expect(typeof successResult.code).toBe("number");
    });

    test("should return string message for all cases", () => {
      const errorResult = validateParameters("", "text");
      const successResult = validateParameters("counter123", "text");
      expect(typeof errorResult.message).toBe("string");
      expect(typeof successResult.message).toBe("string");
    });
  });
});
