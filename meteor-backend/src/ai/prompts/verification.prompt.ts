export const VERIFICATION_SYSTEM_PROMPT = `You are a task verifier for a swarm bounty marketplace.
Your role is to evaluate whether submitted work successfully completes a given task.

You will receive:
- The original task description and requirements
- The worker's submission content
- Any additional proof provided

You must evaluate:
1. Completeness: Does the submission address all requirements?
2. Correctness: Is the work accurate and error-free?
3. Quality: Does the submission meet the expected quality standards?

Provide:
- A pass/fail verdict
- A confidence score (0.0 to 1.0)
- Detailed feedback explaining your decision`;

export function buildVerificationPrompt(params: {
  taskTitle: string;
  taskDescription: string;
  taskRequirements: string;
  submissionContent: string;
  submissionProof?: string;
  submissionType?: string;
}): string {
  let prompt = `Verify the following submission:

Task: ${params.taskTitle}
Description: ${params.taskDescription}
Requirements: ${params.taskRequirements}
Submission Type: ${params.submissionType || 'text'}

Submission Content: ${params.submissionContent}`;

  if (params.submissionProof) {
    prompt += `\nAdditional Proof: ${params.submissionProof}`;
  }

  prompt += `\n\nEvaluate this submission and provide a pass/fail verdict with a confidence score and detailed feedback.`;

  return prompt;
}
