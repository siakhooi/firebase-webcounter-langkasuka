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

// Helper functions to reduce nesting depth
function createMockEventData(counter: string, createAt: number): MockEventData {
  return {counter, createAt};
}

function createMockSnapshot(counter: string, createAt: number): MockSnapshot {
  const eventData = createMockEventData(counter, createAt);
  return {
    data() {
      return eventData;
    },
  };
}

function createMockEvent(docId: string, counter: string, createAt: number): MockEvent {
  return {
    params: {docId},
    data: createMockSnapshot(counter, createAt),
  };
}

function createEmptyMockGetResponse() {
  return {
    data() {
      return undefined;
    },
  };
}

function createExistingDocMockGetResponse(counter: string, count: number) {
  const docData = {counter, count};
  return {
    data() {
      return docData;
    },
  };
}

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
    describe("should create new counter documents when they don't exist", () => {
      test.each([
        [
          "standard date",
          "2024-06-15T10:30:00Z",
          "test-doc-123",
          "test-counter",
          {key1: "2024", key2: "2024-06", key3: "2024-06-15"},
          ["test-counter-2024", "test-counter-2024-06", "test-counter-2024-06-15"],
        ],
        [
          "year boundary",
          "2024-12-31T10:30:00",
          "test-doc-789",
          "boundary-counter",
          {key1: "2024", key2: "2024-12", key3: "2024-12-31"},
          ["boundary-counter-2024", "boundary-counter-2024-12", "boundary-counter-2024-12-31"],
        ],
        [
          "year start",
          "2025-01-01T00:00:00Z",
          "test-doc-new-year",
          "new-year-counter",
          {key1: "2025", key2: "2025-01", key3: "2025-01-01"},
          ["new-year-counter-2025", "new-year-counter-2025-01", "new-year-counter-2025-01-01"],
        ],
      ])("for %s", async (_description, dateString, docId, counterName, expectedKeys, expectedDocIds) => {
        // Mock Firestore to return undefined (document doesn't exist)
        mockGet.mockResolvedValue(createEmptyMockGetResponse());

        const testTime = new Date(dateString).getTime();
        const mockEvent = createMockEvent(docId, counterName, testTime);

        await generateStatistics(mockEvent);

        // Verify logger was called
        expect(mockLogger.info).toHaveBeenCalledWith("generateStatistics", {
          docId: docId,
          counter: counterName,
          ...expectedKeys,
        });

        // Verify documents were accessed with correct IDs
        expect(mockDoc).toHaveBeenCalledWith(expectedDocIds[0]);
        expect(mockDoc).toHaveBeenCalledWith(expectedDocIds[1]);
        expect(mockDoc).toHaveBeenCalledWith(expectedDocIds[2]);
      });

      test("should verify collections and set operations", async () => {
        mockGet.mockResolvedValue(createEmptyMockGetResponse());

        const testTime = new Date("2024-06-15T10:30:00Z").getTime();
        const mockEvent = createMockEvent("test-doc-123", "test-counter", testTime);

        await generateStatistics(mockEvent);

        // Verify collections were accessed
        expect(mockCollection).toHaveBeenCalledWith("counter-by-year");
        expect(mockCollection).toHaveBeenCalledWith("counter-by-year-month");
        expect(mockCollection).toHaveBeenCalledWith("counter-by-year-month-date");

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
    });

    test("should update existing counter documents", async () => {
      // Mock Firestore to return existing documents
      mockGet.mockResolvedValue(createExistingDocMockGetResponse("test-counter", 5));

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent = createMockEvent("test-doc-456", "test-counter", testTime);

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
      mockGet.mockResolvedValue(createEmptyMockGetResponse());

      const testTime = new Date("2024-03-15T12:00:00Z").getTime();
      const counterNames = ["counter-a", "counter-b", "counter-c-d-e"];

      for (const counterName of counterNames) {
        jest.clearAllMocks();

        const mockEvent = createMockEvent(`test-doc-${counterName}`, counterName, testTime);

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
      mockGet.mockResolvedValue(createEmptyMockGetResponse());

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

        const mockEvent = createMockEvent("test-doc", "test-counter", testCase.date.getTime());

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

        mockGet.mockResolvedValue(createExistingDocMockGetResponse("increment-test", count));

        const testTime = new Date("2024-06-15T10:30:00Z").getTime();
        const mockEvent = createMockEvent(`test-doc-${count}`, "increment-test", testTime);

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
      mockGet.mockResolvedValue(createEmptyMockGetResponse());

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent = createMockEvent("test-parallel", "parallel-counter", testTime);

      await generateStatistics(mockEvent);

      // Verify all three collections were accessed
      const collectionCalls = mockCollection.mock.calls.map((call) => call[0]);
      expect(collectionCalls).toContain("counter-by-year");
      expect(collectionCalls).toContain("counter-by-year-month");
      expect(collectionCalls).toContain("counter-by-year-month-date");
      expect(mockCollection).toHaveBeenCalledTimes(6); // 3 for get, 3 for set
    });

    test("should create documents with correct keys", async () => {
      mockGet.mockResolvedValue(createEmptyMockGetResponse());

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent = createMockEvent("test-keys", "key-test", testTime);

      await generateStatistics(mockEvent);

      // Check that set was called with the correct key values
      const setCalls = mockSet.mock.calls as Array<[any]>;
      const keys = setCalls.map((call) => call[0].key);

      expect(keys).toContain("2024");
      expect(keys).toContain("2024-06");
      expect(keys).toContain("2024-06-15");
    });

    test("should include timestamps in created documents", async () => {
      mockGet.mockResolvedValue(createEmptyMockGetResponse());

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent = createMockEvent("test-timestamps", "timestamp-test", testTime);

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
      mockGet.mockResolvedValue(createExistingDocMockGetResponse("timestamp-test", 5));

      const testTime = new Date("2024-06-15T10:30:00Z").getTime();
      const mockEvent = createMockEvent("test-update-timestamps", "timestamp-test", testTime);

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
