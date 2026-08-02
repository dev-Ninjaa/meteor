export interface UseCase {
  title: string;
  description: string;
  category: string;
  rewardAvg: string;
  speed: string;
}

export const USE_CASES: UseCase[] = [
  {
    title: 'AI Verification & Red-Teaming',
    description: 'Human-in-the-loop validation for LLM edge cases, hallucination checking, and ethical safety audits.',
    category: 'AI Safety',
    rewardAvg: '40-100 MON',
    speed: '< 3 mins',
  },
  {
    title: 'Real-World Intelligence',
    description: 'On-the-ground verification, store hours check, physical inspections, and local context gathering worldwide.',
    category: 'Physical Computing',
    rewardAvg: '50-200 MON',
    speed: '< 15 mins',
  },
  {
    title: 'Instant Code Debugging',
    description: 'Micro-tasked code reviews, memory leak diagnosis, and security vulnerability inspection by human experts.',
    category: 'Engineering',
    rewardAvg: '80-300 MON',
    speed: '< 10 mins',
  },
  {
    title: 'Cultural & Idiomatic Translation',
    description: 'Nuanced human translation that captures emotional context, humor, and local slang that AI misses.',
    category: 'Localization',
    rewardAvg: '20-60 MON',
    speed: '< 5 mins',
  },
  {
    title: 'UX & Product Feedback',
    description: 'Rapid user feedback, micro-surveys, and accessibility testing across different browsers and devices.',
    category: 'Product Research',
    rewardAvg: '30-90 MON',
    speed: '< 8 mins',
  },
  {
    title: 'Multimodal Data Annotation',
    description: 'High-precision labeling for audio, thermal satellite, and 3D point cloud training datasets.',
    category: 'Machine Learning',
    rewardAvg: '60-180 MON',
    speed: '< 12 mins',
  },
];