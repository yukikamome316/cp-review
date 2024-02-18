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
