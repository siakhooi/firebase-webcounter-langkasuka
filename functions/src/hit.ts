import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {Firestore} from "firebase-admin/firestore";
import {
  FIREBASE_PROJECT_ID,
  FIREBASE_COLLECTION_COUNTER_ALL_TIME,
  FIREBASE_COLLECTION_HIT_LOG,
} from "./web-counter-config";
import {getOutput, geteTag, getContentType} from "./lib/generateOutput";
import {validateParameters} from "./lib/validateParameters";

const firestore = new Firestore({
  projectId: FIREBASE_PROJECT_ID,
  timestampsInSnapshots: true,
});

export const hit = onRequest(async (request, response) => {
  const counterId: string = <string>request.query.counter;
  const outputType: string = <string>request.query.outputtype;

  const {status, code, message} = validateParameters(counterId, outputType);

  logger.info("Hit", {counterId, outputType, status, code, message});

  if (status) {
    const currentTime = Date.now();
    const docId = await createLog(counterId, currentTime, request);
    const count = await getCount(counterId, currentTime, docId);

    if (outputType === "text" || outputType === "badge" || outputType === "javascript") {
      const content = getOutput(outputType, count);
      const etag = geteTag(content);
      const contentType = getContentType(outputType);
      response
        .status(200)
        .setHeader("Content-Type", contentType)
        .setHeader("Cache-Control", "max-age=0, no-cache, no-store, must-revalidate")
        .setHeader("etag", etag)
        .send(content);
    } else {
      response.status(500).end();
    }
  } else {
    response.status(code).send(message);
  }
});

async function getCount(counterId: string, currentTime: number, docId: string) {
  const CounterCollection = FIREBASE_COLLECTION_COUNTER_ALL_TIME;
  const counterData = (await firestore.collection(CounterCollection).doc(counterId).get()).data();

  let count = 1;
  if (counterData !== undefined) {
    count = counterData.count + 1;
    await firestore
      .collection(CounterCollection)
      .doc(counterId)
      .update({count: count, modifiedAt: currentTime, modifiedBy: docId});
  } else {
    await firestore.collection(CounterCollection).doc(counterId).set({
      counter: counterId,
      count: count,
      createdBy: docId,
      createdAt: currentTime,
      modifiedBy: docId,
      modifiedAt: currentTime,
    });
  }
  return count;
}

async function createLog(counterId: string, currentTime: number, request: any) {
  const COLLECTION_LOG = FIREBASE_COLLECTION_HIT_LOG;
  const docRef = await firestore.collection(COLLECTION_LOG).add({
    counter: counterId,
    createAt: currentTime,
    headers: request.headers,
    method: request.method,
    query: request.query,
    url: request.originalUrl,
    ip: request.ip,
  });
  return docRef.id;
}
