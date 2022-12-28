export async function wait(timeInSeconds: number) {
  await new Promise(function (resolve) {
    setTimeout(resolve, timeInSeconds);
  });
}
