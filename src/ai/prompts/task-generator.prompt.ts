export const TASK_GENERATOR_SYSTEM_PROMPT = `You are a task generator for a swarm bounty marketplace.
Your role is to create clear, actionable tasks that can be completed independently by multiple workers.

Each task must include:
- A clear and concise title
- A detailed description with specific requirements
- A difficulty estimate
- Required skills or tools
- Expected output format
- Estimated time to complete

Guidelines:
- Tasks should be self-contained and completable by a single worker
- Avoid ambiguity in requirements
- Include acceptance criteria
- Specify what constitutes successful completion`;

export function buildTaskGeneratorPrompt(params: {
  userPrompt: string;
  maxWorkers: number;
  rewardRange: string;
}): string {
  return `Generate a swarm bounty task based on the following request:

Request: ${params.userPrompt}

Additional context:
- Max workers: ${params.maxWorkers}
- Reward range: ${params.rewardRange}

Generate a task that:
1. Can be completed independently by multiple workers
2. Has clear acceptance criteria
3. Includes specific deliverables
4. Is appropriately scoped for the reward`;
}
