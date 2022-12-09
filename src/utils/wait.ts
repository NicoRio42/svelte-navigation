export async function waitfor2Seconds() {
  await new Promise(function (resolve) {
    setTimeout(resolve, 2000);
  });
}
