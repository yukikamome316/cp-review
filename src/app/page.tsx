import NextLink from "next/link";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

import { Table, configureAdapter, Link } from "@a01sa01to/ui";

import acList from "@/data/ac_list.json";
import ignoreList from "@/data/ignore_list.json";
import probModels from "@/data/problem_models.json";

import style from "./page.module.css";

export default async function Home() {
  configureAdapter("link", (props) => (
    <NextLink {...props} href={props.href ?? ""} />
  ));

  const problems = new Map<string, [string, number[]]>();
  for (const ac of acList) {
    if (ignoreList.some((part) => ac.problem_id.includes(part))) continue;

    if (problems.has(ac.problem_id)) {
      problems.get(ac.problem_id)![1].push(ac.epoch_second);
    } else {
      problems.set(ac.problem_id, [ac.contest_id, [ac.epoch_second]]);
    }
  }

  // _t: 経過時間 (秒)
  const mem_f = (_t: number) => {
    // _t -> t (日)
    const t = _t / 86400;

    // すぐ解くと意味がないので、 10 日未満はなかったことにする
    if (t < 10) return 1;

    const c = 1.25;
    const k = 1.84;
    return Math.pow(Math.log10(t), c) / (k + Math.pow(Math.log10(t), c));
  };

  const now = dayjs().tz();
  const lists = Array.from(problems.entries())
    .map(([problem_id, [contest_id, list]]) => {
      // @ts-expect-error: problem_id is not index of probModels
      let diff = probModels[problem_id]?.difficulty ?? -1;
      if (diff !== -1 && diff < 400)
        diff = Math.round(400 / Math.exp(1 - diff / 400));

      let priority = 1e5;
      const last_solved = list.slice(-1)[0];

      if (list.length === 0) {
        // なんか変だよ
      } else if (list.slice(-1)[0] + 86400 * 10 >= now.unix()) {
        // 10 日以内に解いた
        priority = -1;
      } else {
        let res = (1 + diff / 8000) * 1000; // max を 1500 くらいにするため
        list.push(now.unix());
        for (let i = 1; i < list.length; i++)
          res *= mem_f(list[i] - list[i - 1]);
        priority = res;
      }

      return { contest_id, problem_id, diff, priority, last_solved };
    })
    .sort((a, b) => b.priority - a.priority);

  return (
    <>
      <p>最終更新: {now.format("YYYY 年 MM 月 DD 日 HH 時ごろ")}</p>
      <Table className={style.table}>
        <tr>
          <th>ID</th>
          <th>Last Solved</th>
          <th>Diff</th>
          <th>Priority</th>
        </tr>
        {lists.map((prob) => (
          <tr key={prob.problem_id}>
            <td>
              <Link
                href={`https://atcoder.jp/contests/${prob.contest_id}/tasks/${prob.problem_id}`}
              >
                {prob.problem_id}
              </Link>
            </td>
            <td>
              {dayjs.unix(prob.last_solved).tz().format("YYYY-MM-DD HH:mm:ss")}
            </td>
            <td>{prob.diff}</td>
            <td>{prob.priority.toFixed(2)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
