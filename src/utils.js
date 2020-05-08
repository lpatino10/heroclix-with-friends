export const mapAsync = async (arr, asyncCallback) => {
  const promises = arr.map(asyncCallback);
  const results = await Promise.all(promises);
  return results;
};
