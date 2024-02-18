export interface SubmissionAPIResponse {
	id: number;
	epoch_second: number;
	problem_id: string;
	contest_id: string;
	user_id: string;
	language: string;
	point: number;
	length: number;
	result: string;
	execution_time: number | null;
}

export interface ProblemsSchema {
	id: string;
	diff: number;
	isMarathon: 0 | 1;
	priority: number;
}

export interface AcSubmissionsSchema {
	id: number;
	submitted_at: number;
	problem_id: string;
}

export interface ProblemModel {
	slope: number;
	intercept: number;
	variance: number;
	difficulty: number;
	discrimination: number;
	irt_loglikelihood: number;
	irt_users: number;
	is_experimental: boolean;
}
