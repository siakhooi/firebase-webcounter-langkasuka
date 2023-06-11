export function validateParameters(counterId: string, outputType: string) {
  if (!counterId) {
    return {status: false, code: 400, message: "parameter counter is not defined!"};
  } else if (!outputType) {
    return {status: false, code: 400, message: "parameter outputtype is not defined!"};
  } else if (outputType !== "text" && outputType !== "badge" && outputType !== "javascript") {
    const message =
      "parameter outputtype is not supported! (found " + outputType + ")";
    return {
      status: false,
      code: 400,
      message: message,
    };
  } else {
    return {status: true, code: 200, message: "OK"};
  }
}
