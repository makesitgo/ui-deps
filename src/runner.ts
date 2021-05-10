const START = new Date();

export default async function run(fn: () => any) {
  try {
    await fn();
  } catch (e) {
    console.log(`command failed\n`, e);
  } finally {
    console.log(`done in ${getRuntime()}.`);
  }
}

function getRuntime() {
  return `${(new Date().getTime() - START.getTime()) / 1000}s`;
}
