import { ProblemsSchema } from './interface';
import { fetchSubmissions, getProbModels, memoryModel, sleep } from './func';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

export interface Env {
	DB: D1Database;
}

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// 最終同期日時を取得する
		let lastSync =
			((await env.DB.prepare('SELECT submitted_at FROM ac_submissions ORDER BY submitted_at DESC LIMIT 1').first<number>('submitted_at')) ??
				0) + 1;

		// fetch
		const submissions = [];
		while (true) {
			const sub = await fetchSubmissions(lastSync);
			if (sub.length === 0) break;
			submissions.push(...sub);
			lastSync = sub.slice(-1)[0].epoch_second + 1;
			await sleep(1000);
		}

		// insert
		console.log(submissions.length);
		for (const submission of submissions) {
			if (submission.result === 'AC') {
				// もし Problems になければ追加する
				// 外部キー制約で落ちるので
				const prob = await env.DB.prepare('SELECT * FROM problems WHERE id = ?1').bind(submission.problem_id).first<ProblemsSchema>();
				if (prob === null) {
					const problem = await getProbModels(submission.problem_id);

					// もし diff がなければ 0
					// そうではない場合は https://github.com/kenkoooo/AtCoderProblems/blob/37e64781e37e7b0332cc8fe54e99d38ff0229d3e/atcoder-problems-frontend/src/utils/index.ts#L49-L52 を参考に
					let difficulty =
						problem === undefined || problem.difficulty === undefined
							? 0
							: problem.difficulty < 400
							? Math.round(400 / Math.exp(1 - problem.difficulty / 400))
							: problem.difficulty;

					await env.DB.prepare('INSERT INTO problems (id, diff, isMarathon, priority) VALUES (?1, ?2, ?3, ?4)')
						// いったん AHC はマラソン確定、それ以外は手動で更新
						.bind(submission.problem_id, difficulty, submission.problem_id.includes('ahc') ? 1 : 0, 0)
						.run();
				}

				// ac_submissions に追加する
				await env.DB.prepare('INSERT INTO ac_submissions (id, submitted_at, problem_id) VALUES (?1, ?2, ?3)')
					.bind(submission.id, submission.epoch_second, submission.problem_id)
					.run();
			}
		}

		// priority の計算
		const problems = await env.DB.prepare('SELECT * FROM problems').all<ProblemsSchema>();
		const nowEpoch = dayjs().tz().unix();

		for (const problem of problems.results) {
			const acs = await env.DB.prepare('SELECT submitted_at FROM ac_submissions WHERE problem_id = ?1 ORDER BY submitted_at ASC')
				.bind(problem.id)
				.all<{ submitted_at: number }>();

			let priority = 1e5;

			if (acs.results.length === 0) {
				// Problems Table にあるなら AC してるはずなのに ac_submissions にないのはなんか変なので priority を INF にしておく
			} else if (problem.isMarathon === 1) {
				// マラソンは復習したくない 🤔
				priority = -1;
			} else {
				// Priority 計算 - 1500 以下にはなるようにする
				priority = memoryModel(
					problem.diff,
					acs.results.map((ac) => ac.submitted_at),
					nowEpoch
				);
			}

			await env.DB.prepare('UPDATE problems SET priority = ?1 WHERE id = ?2').bind(priority, problem.id).run();
		}
	},
};
