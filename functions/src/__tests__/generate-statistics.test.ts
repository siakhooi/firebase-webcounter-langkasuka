import {describe, test, expect, jest, beforeEach, afterEach} from "@jest/globals";

// Type definitions for test mocks
interface MockEventData {
  counter: string;
  createAt: number;
}

interface MockSnapshot {
  data: () => MockEventData;
}

interface MockEvent {
  params: {
    docId: string;
  };
  data: MockSnapshot | undefined | null;
}

// Mock firebase-functions/logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.unstable_mockModule("firebase-functions/logger", () => mockLogger);

// Mock Firestore
const mockUpdate = jest.fn<any>();
const mockSet = jest.fn<any>();
const mockGet = jest.fn<any>();
const mockDoc = jest.fn<any>();
const mockCollection = jest.fn<any>();

class MockFirestore {
  constructor() {
    // Mock implementation
  }

  collection(name: string) {
    mockCollection(name);
    return {
      doc: (docId: string) => {
        mockDoc(docId);
        return {
          get: mockGet,
          set: mockSet,
          update: mockUpdate,
        };
      },
    };
  }
}

jest.unstable_mockModule("firebase-admin/firestore", () => ({
  Firestore: MockFirestore,
}));

// Mock firebase-functions/v2/firestore
const mockOnDocumentCreated = jest.fn((path: string, handler: any) => handler);

jest.unstable_mockModule("firebase-functions/v2/firestore", () => ({
  onDocumentCreated: mockOnDocumentCreated,
}));

describe("generate-statistics", () => {
  let generateStatistics: any;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    mockUpdate.mockResolvedValue(undefined);
    mockSet.mockResolvedValue(undefined);

    // Import the module after mocking
    const module = await import("../generate-statistics.js");
    generateStatistics = module.generateStatistics;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateStatistics function", () => {
    test("should create new counter documents when they don't exist", async () => {
      // Mock Firestore to return undefined (document doesn't exist)
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-doc-123",
        },
        data: {
          data: () => ({
            counter: "test-counter",
            createAt: testTime,
          }),
        },
      };

      await generateStatistics(mockEvent);

      // Verify logger was called
      expect(mockLogger.info).toHaveBeenCalledWith("generateStatistics", {
        docId: "test-doc-123",
        counter: "test-counter",
        key1: "2024",
        key2: "2024-06",
        key3: "2024-06-15",
      });

      // Verify collections were accessed
      expect(mockCollection).toHaveBeenCalledWith("counter-by-year");
      expect(mockCollection).toHaveBeenCalledWith("counter-by-year-month");
      expect(mockCollection).toHaveBeenCalledWith("counter-by-year-month-date");

      // Verify documents were accessed with correct IDs
      expect(mockDoc).toHaveBeenCalledWith("test-counter-2024");
      expect(mockDoc).toHaveBeenCalledWith("test-counter-2024-06");
      expect(mockDoc).toHaveBeenCalledWith("test-counter-2024-06-15");

      // Verify set was called 3 times (once for each collection)
      expect(mockSet).toHaveBeenCalledTimes(3);

      // Verify set was called with correct data structure
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          counter: "test-counter",
          count: 1,
          createdBy: "test-doc-123",
          modifiedBy: "test-doc-123",
        })
      );
    });

    test("should update existing counter documents", async () => {
      // Mock Firestore to return existing documents
      mockGet.mockResolvedValue({
        data: () => ({
          counter: "test-counter",
          count: 5,
        }),
      });

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-doc-456",
        },
        data: {
          data: () => ({
            counter: "test-counter",
            createAt: testTime,
          }),
        },
      };

      await generateStatistics(mockEvent);

      // Verify logger was called
      expect(mockLogger.info).toHaveBeenCalledWith("generateStatistics", {
        docId: "test-doc-456",
        counter: "test-counter",
        key1: "2024",
        key2: "2024-06",
        key3: "2024-06-15",
      });

      // Verify update was called 3 times (once for each collection)
      expect(mockUpdate).toHaveBeenCalledTimes(3);

      // Verify update was called with correct data
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 6,
          modifiedBy: "test-doc-456",
        })
      );

      // Verify set was NOT called (since documents already exist)
      expect(mockSet).not.toHaveBeenCalled();
    });

    test("should handle edge case with year boundary", async () => {
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      // Use local time to avoid timezone issues
      const testTime = new Date("2024-12-31T10:30:00").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-doc-789",
        },
        data: {
          data: () => ({
            counter: "boundary-counter",
            createAt: testTime,
          }),
        },
      };

      await generateStatistics(mockEvent);

      expect(mockLogger.info).toHaveBeenCalledWith("generateStatistics", {
        docId: "test-doc-789",
        counter: "boundary-counter",
        key1: "2024",
        key2: "2024-12",
        key3: "2024-12-31",
      });

      expect(mockDoc).toHaveBeenCalledWith("boundary-counter-2024");
      expect(mockDoc).toHaveBeenCalledWith("boundary-counter-2024-12");
      expect(mockDoc).toHaveBeenCalledWith("boundary-counter-2024-12-31");
    });

    test("should handle edge case with year start", async () => {
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      const testTime = new Date("2025-01-01T00:00:00Z").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-doc-new-year",
        },
        data: {
          data: () => ({
            counter: "new-year-counter",
            createAt: testTime,
          }),
        },
      };

      await generateStatistics(mockEvent);

      expect(mockLogger.info).toHaveBeenCalledWith("generateStatistics", {
        docId: "test-doc-new-year",
        counter: "new-year-counter",
        key1: "2025",
        key2: "2025-01",
        key3: "2025-01-01",
      });
    });

    test("should handle undefined snapshot gracefully", async () => {
      const mockEvent: MockEvent = {
        params: {
          docId: "test-doc-no-data",
        },
        data: undefined,
      };

      await generateStatistics(mockEvent);

      // Verify logger was NOT called (since snapshot is undefined)
      expect(mockLogger.info).not.toHaveBeenCalled();

      // Verify no Firestore operations were performed
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockSet).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    test("should handle null snapshot gracefully", async () => {
      const mockEvent: MockEvent = {
        params: {
          docId: "test-doc-null",
        },
        data: null,
      };

      await generateStatistics(mockEvent);

      // Verify logger was NOT called
      expect(mockLogger.info).not.toHaveBeenCalled();

      // Verify no Firestore operations were performed
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockSet).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    test("should handle different counter names", async () => {
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      const testTime = new Date("2024-03-15T12:00:00Z").getTime();
      const counterNames = ["counter-a", "counter-b", "counter-c-d-e"];

      for (const counterName of counterNames) {
        jest.clearAllMocks();

        const mockEvent: MockEvent = {
          params: {
            docId: `test-doc-${counterName}`,
          },
          data: {
            data: () => ({
              counter: counterName,
              createAt: testTime,
            }),
          },
        };

        await generateStatistics(mockEvent);

        expect(mockDoc).toHaveBeenCalledWith(`${counterName}-2024`);
        expect(mockDoc).toHaveBeenCalledWith(`${counterName}-2024-03`);
        expect(mockDoc).toHaveBeenCalledWith(`${counterName}-2024-03-15`);

        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({
            counter: counterName,
            key: expect.any(String),
            count: 1,
          })
        );
      }
    });

    test("should correctly format dates with moment", async () => {
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      const testCases = [
        {
          date: new Date("2024-01-05T10:30:00"),
          expected: {key1: "2024", key2: "2024-01", key3: "2024-01-05"},
        },
        {
          date: new Date("2023-12-25T10:30:00"),
          expected: {key1: "2023", key2: "2023-12", key3: "2023-12-25"},
        },
        {
          date: new Date("2025-07-04T10:30:00"),
          expected: {key1: "2025", key2: "2025-07", key3: "2025-07-04"},
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();

        const mockEvent: MockEvent = {
          params: {
            docId: "test-doc",
          },
          data: {
            data: () => ({
              counter: "test-counter",
              createAt: testCase.date.getTime(),
            }),
          },
        };

        await generateStatistics(mockEvent);

        expect(mockLogger.info).toHaveBeenCalledWith(
          "generateStatistics",
          expect.objectContaining(testCase.expected)
        );
      }
    });

    test("should handle incrementing counter multiple times", async () => {
      const counters = [1, 2, 5, 10, 100];

      for (const count of counters) {
        jest.clearAllMocks();

        mockGet.mockResolvedValue({
          data: () => ({
            counter: "increment-test",
            count: count,
          }),
        });

        const testTime = new Date("2024-06-15T10:30:00Z").getTime();
        const mockEvent: MockEvent = {
          params: {
            docId: `test-doc-${count}`,
          },
          data: {
            data: () => ({
              counter: "increment-test",
              createAt: testTime,
            }),
          },
        };

        await generateStatistics(mockEvent);

        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            count: count + 1,
            modifiedBy: `test-doc-${count}`,
          })
        );
      }
    });

    test("should process all three collections in parallel", async () => {
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-parallel",
        },
        data: {
          data: () => ({
            counter: "parallel-counter",
            createAt: testTime,
          }),
        },
      };

      await generateStatistics(mockEvent);

      // Verify all three collections were accessed
      const collectionCalls = mockCollection.mock.calls.map((call) => call[0]);
      expect(collectionCalls).toContain("counter-by-year");
      expect(collectionCalls).toContain("counter-by-year-month");
      expect(collectionCalls).toContain("counter-by-year-month-date");
      expect(mockCollection).toHaveBeenCalledTimes(6); // 3 for get, 3 for set
    });

    test("should create documents with correct keys", async () => {
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-keys",
        },
        data: {
          data: () => ({
            counter: "key-test",
            createAt: testTime,
          }),
        },
      };

      await generateStatistics(mockEvent);

      // Check that set was called with the correct key values
      const setCalls = mockSet.mock.calls as Array<[any]>;
      const keys = setCalls.map((call) => call[0].key);

      expect(keys).toContain("2024");
      expect(keys).toContain("2024-06");
      expect(keys).toContain("2024-06-15");
    });

    test("should include timestamps in created documents", async () => {
      mockGet.mockResolvedValue({
        data: () => undefined,
      });

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-timestamps",
        },
        data: {
          data: () => ({
            counter: "timestamp-test",
            createAt: testTime,
          }),
        },
      };

      const beforeExecution = Date.now();
      await generateStatistics(mockEvent);
      const afterExecution = Date.now();

      // Verify that set was called with createdAt and modifiedAt
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.any(Number),
          modifiedAt: expect.any(Number),
        })
      );

      // Verify timestamps are within reasonable range
      const setCalls = mockSet.mock.calls as Array<[any]>;
      setCalls.forEach((call) => {
        expect(call[0].createdAt).toBeGreaterThanOrEqual(beforeExecution);
        expect(call[0].createdAt).toBeLessThanOrEqual(afterExecution);
        expect(call[0].modifiedAt).toBeGreaterThanOrEqual(beforeExecution);
        expect(call[0].modifiedAt).toBeLessThanOrEqual(afterExecution);
      });
    });

    test("should include timestamps in updated documents", async () => {
      mockGet.mockResolvedValue({
        data: () => ({
          counter: "timestamp-test",
          count: 5,
        }),
      });

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent: MockEvent = {
        params: {
          docId: "test-update-timestamps",
        },
        data: {
          data: () => ({
            counter: "timestamp-test",
            createAt: testTime,
          }),
        },
      };

      const beforeExecution = Date.now();
      await generateStatistics(mockEvent);
      const afterExecution = Date.now();

      // Verify that update was called with modifiedAt
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          modifiedAt: expect.any(Number),
        })
      );

      // Verify timestamps are within reasonable range
      const updateCalls = mockUpdate.mock.calls as Array<[any]>;
      updateCalls.forEach((call) => {
        expect(call[0].modifiedAt).toBeGreaterThanOrEqual(beforeExecution);
        expect(call[0].modifiedAt).toBeLessThanOrEqual(afterExecution);
      });
    });
  });
});
