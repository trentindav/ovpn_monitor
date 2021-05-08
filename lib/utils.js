module.exports = {
  sleep: sleep,
};

/**
 * Sleep, to be used with await
 * @param {int} ms - milliseconds
 * @return Promise
 */
async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
