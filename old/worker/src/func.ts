import { User } from './const';
import { ProblemModel, SubmissionAPIResponse } from './interface';

const fetcher = async (url: string) => {
	return fetch(url, {
		headers: {
			Accept: '*/*',
			'Accept-Encoding': 'gzip, deflate, br',
			'Cache-Control': 'no-cache',
		},
	});
};

export const fetchSubmissions = async (from_second: number) => {
	const url = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${User}&from_second=${from_second}`;

	const res = await fetcher(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch submissions: ${res.status} ${res.statusText}`);
	}

	const data = await res.json<SubmissionAPIResponse[]>();
	return data;
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let ProbModels: Record<string, ProblemModel> | null = null;

export const getProbModels = async (id: string) => {
	if (ProbModels === null) {
		const res = await fetcher('https://kenkoooo.com/atcoder/resources/problem-models.json');
		if (!res.ok) {
			throw new Error(`Failed to fetch problems.json: ${res.status} ${res.statusText}`);
		}

		ProbModels = await res.json<Record<string, ProblemModel>>();
	}

	return Promise.resolve(ProbModels[id]);
};

export const memoryModel = (diff: number, ac_times: number[], now: number) => {
	let res = (1 + diff / 8000) * 1000; // max を 1500 くらいにするため
	ac_times.push(now);

	const f = (t: number) => {
		const c = 1.25;
		const k = 1.84;
		return Math.pow(Math.log10(t), c) / (k + Math.pow(Math.log10(t), c));
	};

	for (let i = 1; i < ac_times.length; i++) {
		res *= f(ac_times[i] - ac_times[i - 1]);
	}

	return res;
};
