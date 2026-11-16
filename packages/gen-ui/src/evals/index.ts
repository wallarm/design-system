/**
 * `@wallarm-org/gen-ui/evals`: score an agent's answers for quality, not only validity. The cases
 * say what a good answer does; `scoreAnswer` reads an answer in any format and reports its errors,
 * composition warnings and the expectations it meets. `pnpm evals` runs the cases against a model.
 */
export { EVAL_CASES, type EvalCase, type Expectation } from './cases';
export { type EvalAnswer, type EvalScore, scoreAnswer } from './score';
