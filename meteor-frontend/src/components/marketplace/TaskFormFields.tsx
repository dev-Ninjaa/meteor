import { TaskCategory, SubmissionType, VerificationType } from '../../types';

interface TaskFormState {
  prompt: string;
  title: string;
  description: string;
  reward: string;
  workers: string;
  duration: string;
  category: TaskCategory;
  submissionType: SubmissionType;
  verificationType: VerificationType;
  autoPay: boolean;
  consensusThreshold: string;
  visibility: 'Public' | 'Private';
}

interface TaskFormFieldsProps {
  form: TaskFormState & {
    setField: <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => void;
  };
}

export function TaskFormFields({ form }: TaskFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      <div className="sm:col-span-2">
        <label className="text-xs font-mono text-white/60 mb-1 block">Title</label>
        <input
          type="text"
          value={form.title || ''}
          onChange={(e) => form.setField('title', e.target.value)}
          placeholder="Task title"
          className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
        />
      </div>

      <div>
        <label className="text-xs font-mono text-white/60 mb-1 block">Reward per Worker (MON)</label>
        <input
          type="number"
          value={form.reward}
          onChange={(e) => form.setField('reward', e.target.value)}
          className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
        />
      </div>

      <div>
        <label className="text-xs font-mono text-white/60 mb-1 block">Number of Workers Needed</label>
        <input
          type="number"
          value={form.workers}
          onChange={(e) => form.setField('workers', e.target.value)}
          className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
        />
      </div>

      <div>
        <label className="text-xs font-mono text-white/60 mb-1 block">Submission Type</label>
        <select
          value={form.submissionType}
          onChange={(e) => form.setField('submissionType', e.target.value as SubmissionType)}
          className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
        >
          <option value="text">Text Response</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="rating">Rating (1-5 Stars)</option>
          <option value="image">Image Upload</option>
          <option value="gps">GPS / Location Photo</option>
          <option value="screen_recording">Screen Recording</option>
          <option value="checklist">Verification Checklist</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-mono text-white/60 mb-1 block">Verification Pipeline</label>
        <select
          value={form.verificationType}
          onChange={(e) => form.setField('verificationType', e.target.value as VerificationType)}
          className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
        >
          <option value="AI Verification">AI Verification</option>
          <option value="Human Review">Human Review</option>
          <option value="AI First">AI First Pipeline</option>
          <option value="Consensus">Swarm Consensus</option>
          <option value="Creator Review">Creator Review</option>
          <option value="Hybrid">Hybrid (AI + Human)</option>
        </select>
      </div>
    </div>
  );
}