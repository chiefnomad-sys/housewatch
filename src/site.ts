// Site-wide settings. Change LOOK to 'black' to flip the whole site to the black background.
export const SITE = {
  name: 'Housewatch',
  url: 'https://housewatch.news',
  tagline: 'News for the rank and file',
  description: 'Independent news for the everyday firefighter: your paycheck, your health and the job.',
  look: 'white' as 'white' | 'black',
};

export const BEATS = [
  { name: 'Paycheck', slug: 'paycheck', about: 'Pay, contracts, overtime, staffing, pensions and schedules.' },
  { name: 'Health', slug: 'health', about: 'Cancer, PFAS, cardiac, behavioral health, injuries, presumption laws and workers’ comp.' },
  { name: 'The Job', slug: 'the-job', about: 'Tactics, training, apparatus, culture and the people in the firehouse.' },
  { name: 'Gear', slug: 'gear', about: 'Turnout gear, SCBA, tools and what departments are buying.' },
] as const;

export type BeatName = (typeof BEATS)[number]['name'];
export const beatSlug = (name: string) => BEATS.find((b) => b.name === name)?.slug ?? 'news';
