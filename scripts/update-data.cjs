const { readFile, writeFile } = require("fs/promises")
const { resolve } = require("path")

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function dlProblem() {
  const filePath = resolve(__dirname, "../src/data/problem_models.json")
  const res = await fetch(
    "https://kenkoooo.com/atcoder/resources/problem-models.json",
    {
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch problems: ${res.status} ${res.statusText}`);
  }

  await writeFile(filePath, JSON.stringify(await res.json(), null, 0));
}

async function crawl() {
  const filePath = resolve(__dirname, '../src/data/ac_list.json');

  const acList = await readFile(filePath, 'utf-8').then(JSON.parse);

  let lastSync = acList.length === 0 ? 0 : acList.slice(-1)[0].epoch_second;

  const submissions = [];
  while (true) {
    const res = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?from_second=${lastSync + 1}&user=yukikamome316`, {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch submissions: ${res.status} ${res.statusText}`);
    }

    const sub = await res.json();

    if (sub.length === 0) break;

    submissions.push(...sub.filter(s => s.result === "AC").map(s => ({
      id: s.id,
      contest_id: s.contest_id,
      epoch_second: s.epoch_second,
      problem_id: s.problem_id,
    })));

    lastSync = sub.slice(-1)[0].epoch_second;
    await sleep(1000);
  }

  const newACList = acList.concat(submissions);
  await writeFile(filePath, JSON.stringify(newACList, null, 0));
}

(async () => {
  await dlProblem()
  await sleep(1000)
  await crawl()
})()
