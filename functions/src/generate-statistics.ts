import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {Firestore} from "firebase-admin/firestore";
import moment from "moment";
import {
  FIREBASE_PROJECT_ID,
  FIREBASE_COLLECTION_HIT_LOG,
  FIREBASE_COLLECTION_COUNTER_YYYY,
  FIREBASE_COLLECTION_COUNTER_YYYYMM,
  FIREBASE_COLLECTION_COUNTER_YYYYMMDD,
} from "./web-counter-config";

const firestore = new Firestore({
  projectId: FIREBASE_PROJECT_ID,
  timestampsInSnapshots: true,
});

async function updateStatCollection(
  collectionName: string,
  key: string,
  docId: string,
  counter: string,
  currentTime: number
) {
  const statKey = counter + "-" + key;

  const counterData = (await firestore.collection(collectionName).doc(statKey).get()).data();

  let count = 1;
  if (counterData !== undefined) {
    count = counterData.count + 1;
    await firestore
      .collection(collectionName)
      .doc(statKey)
      .update({count: count, modifiedBy: docId, modifiedAt: currentTime});
  } else {
    await firestore.collection(collectionName).doc(statKey).set({
      counter: counter,
      key: key,
      count: count,
      createdBy: docId,
      modifiedBy: docId,
      createdAt: currentTime,
      modifiedAt: currentTime,
    });
  }
}

export const generateStatistics = onDocumentCreated(FIREBASE_COLLECTION_HIT_LOG + "/{docId}", async (event) => {
  const docId = event.params.docId;
  const snapshot = event.data;
  const currentTime = Date.now();

  if (snapshot) {
    const data = snapshot.data();
    const counter = data.counter;
    const key1 = moment(data.createAt).format("YYYY");
    const key2 = moment(data.createAt).format("YYYY-MM");
    const key3 = moment(data.createAt).format("YYYY-MM-DD");

    logger.info("generateStatistics", {docId, counter, key1, key2, key3});

    await Promise.all([
      updateStatCollection(FIREBASE_COLLECTION_COUNTER_YYYY, key1, docId, counter, currentTime),
      updateStatCollection(FIREBASE_COLLECTION_COUNTER_YYYYMM, key2, docId, counter, currentTime),
      updateStatCollection(FIREBASE_COLLECTION_COUNTER_YYYYMMDD, key3, docId, counter, currentTime),
    ]);
  }
});
