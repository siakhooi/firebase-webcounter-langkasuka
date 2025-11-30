import {Request} from "firebase-functions/v2/https";
import {Firestore} from "firebase-admin/firestore";
import {FIREBASE_COLLECTION_HIT_LOG} from "../web-counter-config.js";

export async function createLog(
  firestore: Firestore,
  counterId: string,
  currentTime: number,
  request: Request
) {
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
