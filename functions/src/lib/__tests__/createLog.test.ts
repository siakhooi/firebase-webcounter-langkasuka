import {describe, test, expect, jest, beforeEach} from "@jest/globals";
import type {Firestore} from "firebase-admin/firestore";
import {createLog} from "../createLog.js";

describe("createLog", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockRequest: any;
  let mockAdd: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdd = jest.fn();
    mockAdd.mockResolvedValue({id: "default-log-id"});
    mockCollection = jest.fn(() => ({
      add: mockAdd,
    }));

    mockFirestore = {
      collection: mockCollection,
    } as unknown as jest.Mocked<Firestore>;

    mockRequest = {
      query: {counter: "test-counter", outputtype: "text"},
      headers: {"user-agent": "test-agent"},
      method: "GET",
      originalUrl: "/hit?counter=test",
      ip: "198.51.100.1", // Using TEST-NET-2 documentation IP (RFC 5737)
    };
  });

  describe("successful log creation", () => {
    test("should create log with all request information", async () => {
      const currentTime = Date.now();
      const counterId = "test-counter";
      mockAdd.mockResolvedValue({id: "log-id-123"});

      const result = await createLog(
        mockFirestore,
        counterId,
        currentTime,
        mockRequest
      );

      expect(result).toBe("log-id-123");
      expect(mockCollection).toHaveBeenCalledWith("counter-hit-logs");
      expect(mockAdd).toHaveBeenCalledWith({
        counter: counterId,
        createAt: currentTime,
        headers: mockRequest.headers,
        method: mockRequest.method,
        query: mockRequest.query,
        url: mockRequest.originalUrl,
        ip: mockRequest.ip,
      });
    });

    test("should handle POST request", async () => {
      const currentTime = Date.now();
      mockRequest.method = "POST";
      mockAdd.mockResolvedValue({id: "log-id-456"});

      const result = await createLog(
        mockFirestore,
        "post-counter",
        currentTime,
        mockRequest
      );

      expect(result).toBe("log-id-456");
      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.method).toBe("POST");
    });

    test("should handle different counter IDs", async () => {
      const currentTime = Date.now();
      const counterIds = ["counter-1", "counter-2", "test-counter-special"];

      for (const counterId of counterIds) {
        mockAdd.mockResolvedValue({id: `log-id-${counterId}`});

        const result = await createLog(
          mockFirestore,
          counterId,
          currentTime,
          mockRequest
        );

        expect(result).toBe(`log-id-${counterId}`);
        const addArgs = mockAdd.mock.calls[mockAdd.mock.calls.length - 1][0];
        expect(addArgs.counter).toBe(counterId);
      }
    });
  });

  describe("request data capturing", () => {
    test("should capture all headers", async () => {
      mockRequest.headers = {
        "user-agent": "Mozilla/5.0",
        "accept": "text/html",
        "content-type": "application/json",
      };
      mockAdd.mockResolvedValue({id: "log-id"});

      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.headers).toEqual(mockRequest.headers);
    });

    test("should capture query parameters", async () => {
      mockRequest.query = {
        counter: "test-counter",
        outputtype: "badge",
        extra: "param",
      };
      mockAdd.mockResolvedValue({id: "log-id"});

      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.query).toEqual(mockRequest.query);
    });

    test("should capture original URL", async () => {
      mockRequest.originalUrl = "/hit?counter=test&outputtype=text";
      mockAdd.mockResolvedValue({id: "log-id"});

      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.url).toBe("/hit?counter=test&outputtype=text");
    });

    test("should capture IP address", async () => {
      const testRequest = {
        ...mockRequest,
        ip: "203.0.113.1", // Using TEST-NET-3 documentation IP (RFC 5737)
      };

      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        testRequest
      );

      const addArgs = mockAdd.mock.calls[mockAdd.mock.calls.length - 1][0];
      expect(addArgs.ip).toBe("203.0.113.1");
    });
  });

  describe("timestamp handling", () => {
    test("should use provided timestamp", async () => {
      const timestamp = 1234567890000;

      await createLog(
        mockFirestore,
        "test-counter",
        timestamp,
        mockRequest
      );

      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.createAt).toBe(timestamp);
    });

    test("should handle different timestamps", async () => {
      const timestamps = [Date.now(), Date.now() - 1000, Date.now() + 1000];

      for (const timestamp of timestamps) {
        await createLog(
          mockFirestore,
          "test-counter",
          timestamp,
          mockRequest
        );

        const addArgs = mockAdd.mock.calls[mockAdd.mock.calls.length - 1][0];
        expect(addArgs.createAt).toBe(timestamp);
      }
    });
  });

  describe("edge cases", () => {
    test("should handle counter with special characters", async () => {
      const counterId = "counter-with_special.chars";
      mockAdd.mockResolvedValue({id: "log-id"});

      const result = await createLog(
        mockFirestore,
        counterId,
        Date.now(),
        mockRequest
      );

      expect(result).toBe("log-id");
      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.counter).toBe(counterId);
    });

    test("should handle empty headers", async () => {
      mockRequest.headers = {};

      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.headers).toEqual({});
    });

    test("should handle empty query", async () => {
      mockRequest.query = {};

      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      const addArgs = mockAdd.mock.calls[0][0];
      expect(addArgs.query).toEqual({});
    });

    test("should handle various HTTP methods", async () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        mockRequest.method = method;
        await createLog(
          mockFirestore,
          "test-counter",
          Date.now(),
          mockRequest
        );

        const addArgs = mockAdd.mock.calls[mockAdd.mock.calls.length - 1][0];
        expect(addArgs.method).toBe(method);
      }
    });
  });

  describe("firestore integration", () => {
    test("should call firestore collection with correct name", async () => {
      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      expect(mockCollection).toHaveBeenCalledWith("counter-hit-logs");
      expect(mockCollection).toHaveBeenCalledTimes(1);
    });

    test("should call add method on collection", async () => {
      await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        counter: expect.any(String),
        createAt: expect.any(Number),
      }));
    });

    test("should return document ID from firestore", async () => {
      const expectedId = "generated-doc-id-123";
      mockAdd.mockResolvedValue({id: expectedId});

      const result = await createLog(
        mockFirestore,
        "test-counter",
        Date.now(),
        mockRequest
      );

      expect(result).toBe(expectedId);
    });

    test("should handle different document IDs", async () => {
      const docIds = ["id-1", "id-2", "very-long-id-with-special-chars_123"];

      for (const docId of docIds) {
        mockAdd.mockResolvedValue({id: docId});

        const result = await createLog(
          mockFirestore,
          "test-counter",
          Date.now(),
          mockRequest
        );

        expect(result).toBe(docId);
      }
    });
  });
});
