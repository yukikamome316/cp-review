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
