import { ProblemsSchema } from './interface';
import { fetchSubmissions, getProbModels, sleep } from './func';

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

					await env.DB.prepare('INSERT INTO problems (id, diff, priority) VALUES (?1, ?2, ?3)')
						.bind(submission.problem_id, difficulty, 0)
						.run();
				}

				// ac_submissions に追加する
				await env.DB.prepare('INSERT INTO ac_submissions (id, submitted_at, problem_id) VALUES (?1, ?2, ?3)')
					.bind(submission.id, submission.epoch_second, submission.problem_id)
					.run();
			}
		}
	},
};
