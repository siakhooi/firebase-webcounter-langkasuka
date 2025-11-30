import {onRequest, Request} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {Firestore} from "firebase-admin/firestore";
import {
  FIREBASE_PROJECT_ID,
  FIREBASE_COLLECTION_COUNTER_ALL_TIME,
} from "./web-counter-config.js";
import {getOutput, geteTag, getContentType} from "./lib/generateOutput.js";
import {validateParameters} from "./lib/validateParameters.js";
import {createLog} from "./lib/createLog.js";

const firestore = new Firestore({
  projectId: FIREBASE_PROJECT_ID,
});

export const hit = onRequest(async (request: Request, response) => {
  const counterId: string = <string>request.query.counter;
  const outputType: string = <string>request.query.outputtype;

  const {status, code, message} = validateParameters(counterId, outputType);

  logger.info("Hit", {counterId, outputType, status, code, message});

  if (status) {
    const currentTime = Date.now();
    const docId = await createLog(firestore, counterId, currentTime, request);
    const count = await getCount(counterId, currentTime, docId);

    try {
      const content = getOutput(outputType, count);
      const etag = geteTag(content);
      const contentType = getContentType(outputType);
      response
        .status(200)
        .setHeader("Content-Type", contentType)
        .setHeader("Cache-Control", "max-age=0, no-cache, no-store, must-revalidate")
        .setHeader("etag", etag)
        .send(content);

    } catch (error) {
      response.status(500).send(error);
    }

  } else {
    response.status(code).send(message);
  }
});

async function getCount(counterId: string, currentTime: number, docId: string) {
  const CounterCollection = FIREBASE_COLLECTION_COUNTER_ALL_TIME;
  const counterData = (await firestore.collection(CounterCollection).doc(counterId).get()).data();

  let count = 1;
  if (counterData === undefined) {
    await firestore.collection(CounterCollection).doc(counterId).set({
      counter: counterId,
      count: count,
      createdBy: docId,
      createdAt: currentTime,
      modifiedBy: docId,
      modifiedAt: currentTime,
    });
  } else {
    count = counterData.count + 1;
    await firestore
      .collection(CounterCollection)
      .doc(counterId)
      .update({count: count, modifiedAt: currentTime, modifiedBy: docId});
  }
  return count;
}

