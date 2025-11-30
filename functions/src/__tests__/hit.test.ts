import {describe, test, expect, jest, beforeEach} from "@jest/globals";
import type {Request} from "firebase-functions/v2/https";

// Setup mocks for all external dependencies
const mockInfo = jest.fn();
const mockValidateParameters = jest.fn();
const mockGetOutput = jest.fn();
const mockGeteTag = jest.fn();
const mockGetContentType = jest.fn();

const mockGet = jest.fn() as jest.Mock;
const mockSet = jest.fn() as jest.Mock;
const mockUpdate = jest.fn() as jest.Mock;
const mockAdd = jest.fn() as jest.Mock;
const mockDoc = jest.fn(() => ({
  get: mockGet,
  set: mockSet,
  update: mockUpdate,
})) as jest.Mock;
const mockCollection = jest.fn(() => ({
  doc: mockDoc,
  add: mockAdd,
})) as jest.Mock;

// Use unstable_mockModule for ES modules
jest.unstable_mockModule("firebase-functions/logger", () => ({
  info: mockInfo,
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

jest.unstable_mockModule("firebase-admin/firestore", () => ({
  Firestore: jest.fn().mockImplementation(() => ({
    collection: mockCollection,
  })),
}));

jest.unstable_mockModule("../lib/generateOutput.js", () => ({
  getOutput: mockGetOutput,
  geteTag: mockGeteTag,
  getContentType: mockGetContentType,
}));

jest.unstable_mockModule("../lib/validateParameters.js", () => ({
  validateParameters: mockValidateParameters,
}));

// Import the module to test after mocking
const {hit} = await import("../hit.js");

describe("hit function", () => {
  let mockResponse: any;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      query: {},
      headers: {},
      method: "GET",
      originalUrl: "/hit",
      ip: "198.51.100.1", // Using TEST-NET-2 documentation IP (RFC 5737)
    };

    mockValidateParameters.mockReturnValue({
      status: true,
      code: 200,
      message: "OK",
    });

    mockGetOutput.mockReturnValue("test-output");
    mockGeteTag.mockReturnValue("test-etag");
    mockGetContentType.mockReturnValue("text/plain");
  });

  describe("main function", () => {
    test("should handle valid text output request with new counter", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id-123"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
      expect(mockResponse.send).toHaveBeenCalledWith("test-output");
      expect(mockValidateParameters).toHaveBeenCalledWith("test-counter", "text");
      expect(mockGetOutput).toHaveBeenCalledWith("text", 1);
    });

    test("should handle existing counter and increment count", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "badge"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({
        data: () => ({
          counter: "test-counter",
          count: 5,
        }),
      });
      // @ts-expect-error - Mock function requires any type for flexibility
      mockUpdate.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id-456"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockGetOutput).toHaveBeenCalledWith("badge", 6);
    });

    test("should return error when validation fails", async () => {
      mockRequest.query = {counter: "", outputtype: "text"};

      mockValidateParameters.mockReturnValue({
        status: false,
        code: 400,
        message: "parameter counter is not defined!",
      });

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith("parameter counter is not defined!");
      expect(mockAdd).not.toHaveBeenCalled();
    });

    test("should handle javascript output type", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "javascript"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      mockGetContentType.mockReturnValue("application/javascript");

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockGetContentType).toHaveBeenCalledWith("javascript");
    });
  });

  describe("counter management", () => {
    test("should create new counter with correct data", async () => {
      mockRequest.query = {counter: "new-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id-123"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockSet).toHaveBeenCalled();
      const setArgs = mockSet.mock.calls[0][0] as any;
      expect(setArgs.counter).toBe("new-counter");
      expect(setArgs.count).toBe(1);
      expect(setArgs.createdBy).toBe("log-id-123");
    });

    test("should increment existing counter correctly", async () => {
      mockRequest.query = {counter: "existing-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({
        data: () => ({
          counter: "existing-counter",
          count: 42,
        }),
      });
      // @ts-expect-error - Mock function requires any type for flexibility
      mockUpdate.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id-456"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockUpdate).toHaveBeenCalled();
      const updateArgs = mockUpdate.mock.calls[0][0] as any;
      expect(updateArgs.count).toBe(43);
      expect(mockGetOutput).toHaveBeenCalledWith("text", 43);
    });

    test("should use correct collection names", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      const collectionCalls = mockCollection.mock.calls.map((call: any[]) => call[0]);
      expect(collectionCalls).toContain("counter-all-time");
      expect(collectionCalls).toContain("counter-hit-logs");
    });
  });

  describe("logging", () => {
    test("should create log with request information", async () => {
      mockRequest = {
        query: {counter: "test-counter", outputtype: "text"},
        headers: {"user-agent": "test-agent"},
        method: "POST",
        originalUrl: "/hit?counter=test",
        ip: "203.0.113.1", // Using TEST-NET-3 documentation IP (RFC 5737)
      };
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockAdd).toHaveBeenCalled();
      const addArgs = mockAdd.mock.calls[0][0] as any;
      expect(addArgs.counter).toBe("test-counter");
      expect(addArgs.method).toBe("POST");
      expect(addArgs.ip).toBe("203.0.113.1");
    });

    test("should log with firebase logger", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockInfo).toHaveBeenCalledWith("Hit", expect.objectContaining({
        counterId: "test-counter",
        outputType: "text",
      }));
    });
  });

  describe("response headers", () => {
    test("should set cache-control headers", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "max-age=0, no-cache, no-store, must-revalidate"
      );
    });

    test("should set etag header", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockGeteTag).toHaveBeenCalledWith("test-output");
      expect(mockResponse.setHeader).toHaveBeenCalledWith("etag", "test-etag");
    });

    test("should set correct content-types", async () => {
      mockRequest.query = {counter: "test-counter", outputtype: "badge"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      mockGetContentType.mockReturnValue("image/svg+xml");

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockGetContentType).toHaveBeenCalledWith("badge");
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    });
  });

  describe("edge cases", () => {
    test("should handle counter with special characters", async () => {
      mockRequest.query = {counter: "counter-with_special.chars", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({data: () => undefined});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockSet.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      expect(mockDoc).toHaveBeenCalledWith("counter-with_special.chars");
    });

    test("should handle zero counter values", async () => {
      mockRequest.query = {counter: "zero-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({
        data: () => ({
          counter: "zero-counter",
          count: 0,
        }),
      });
      // @ts-expect-error - Mock function requires any type for flexibility
      mockUpdate.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      const updateArgs = mockUpdate.mock.calls[0][0] as any;
      expect(updateArgs.count).toBe(1);
    });

    test("should handle large counter values", async () => {
      mockRequest.query = {counter: "large-counter", outputtype: "text"};
      // @ts-expect-error - Mock function requires any type for flexibility
      mockGet.mockResolvedValue({
        data: () => ({
          counter: "large-counter",
          count: 999999999,
        }),
      });
      // @ts-expect-error - Mock function requires any type for flexibility
      mockUpdate.mockResolvedValue({});
      // @ts-expect-error - Mock function requires any type for flexibility
      mockAdd.mockResolvedValue({id: "log-id"});

      // Type assertion needed: mockRequest is Partial<Request> but hit() expects Request
      await hit(mockRequest as Request, mockResponse);

      const updateArgs = mockUpdate.mock.calls[0][0] as any;
      expect(updateArgs.count).toBe(1000000000);
    });
  });
});
