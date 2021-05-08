const { isMainThread, parentPort } = require("worker_threads");

if (isMainThread) {
  console.log("This lib can only be a worker");
} else {
  console.log("I am a worker");
  parentPort.on("message", (message) => {
    console.log(`Worker received ${message}`);
  });
  parentPort.postMessage("HELLO");
}
