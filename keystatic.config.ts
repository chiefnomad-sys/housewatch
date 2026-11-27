import { config, collection, singleton, fields } from '@keystatic/core';

// `npm run dev` edits the Markdown files on disk (local storage).
// The live site saves to GitHub once the Keystatic GitHub App env vars are set on
// Netlify (see README); each save is a commit to main, which redeploys the site.
const useGitHub =
  import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github' ||
  (import.meta.env.PROD && Boolean(import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG));

function sitePage(label: string, slug: string, dated = false) {
  return singleton({
    label,
    path: `src/content/pages/${slug}`,
    format: { contentField: 'body' },
    entryLayout: 'content',
    schema: {
      title: fields.text({ label: 'Page title', validation: { isRequired: true } }),
      description: fields.text({ label: 'Summary', description: 'Shown under the title and in search results.', multiline: true }),
      ...(dated ? { updated: fields.date({ label: 'Last updated' }) } : {}),
      body: fields.markdoc({ label: 'Page', extension: 'md' }),
    },
  });
}

const beats = [
  { label: 'Paycheck', value: 'Paycheck' },
  { label: 'Health', value: 'Health' },
  { label: 'The Job', value: 'The Job' },
  { label: 'Gear', value: 'Gear' },
];

export default config({
  storage: useGitHub ? { kind: 'github', repo: 'chiefnomad-sys/housewatch' } : { kind: 'local' },
  ui: {
    brand: { name: 'Housewatch' },
    navigation: { Stories: ['articles'], 'Site pages': ['about', 'corrections', 'contact', 'privacy'] },
  },
  singletons: {
    about: sitePage('About', 'about'),
    corrections: sitePage('Corrections policy', 'corrections'),
    contact: sitePage('Contact', 'contact'),
    privacy: sitePage('Privacy', 'privacy', true),
  },
  collections: {
    articles: collection({
      label: 'Stories',
      path: 'src/content/articles/*',
      slugField: 'title',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Headline', validation: { isRequired: true } } }),
        dek: fields.text({ label: 'Dek', description: 'One or two sentences under the headline.', multiline: true, validation: { isRequired: true } }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        beats: fields.multiselect({ label: 'Beats', description: 'The first one ticked, in list order, is the main beat.', options: beats, defaultValue: ['Paycheck'] }),
        author: fields.text({ label: 'Byline', defaultValue: 'Housewatch staff' }),
        short: fields.array(fields.text({ label: 'Line' }), {
          label: 'The short version',
          description: 'Two or three lines for people reading between calls.',
          itemLabel: (props) => props.value || 'Line',
        }),
        featured: fields.checkbox({ label: 'Lead story', description: 'Pin this as the homepage lead. Otherwise the newest story leads.' }),
        image: fields.image({ label: 'Photo', description: 'Optional. Only photos we have the rights to. Photos never go on share cards.', directory: 'public/images/stories', publicPath: '/images/stories/' }),
        imageAlt: fields.text({ label: 'Photo description (alt text)', multiline: true }),
        imageCaption: fields.text({ label: 'Photo caption', multiline: true }),
        imageCredit: fields.text({ label: 'Photo credit and license' }),
        pull_quote: fields.object(
          {
            text: fields.text({ label: 'Quote', description: 'Word for word, from a public, attributed source. Leave empty for no pull quote.', multiline: true }),
            attribution: fields.text({ label: 'Who said it', description: 'Name and title, for example Capt. Jane Doe, Springfield Fire Department.' }),
            source: fields.text({ label: 'Where it was published', description: 'Optional, for example The Morning Call.' }),
            after_paragraph: fields.integer({ label: 'Show after paragraph', description: '1 to 6. Keep it in the top third of the story.', defaultValue: 2, validation: { min: 1, max: 6 } }),
          },
          { label: 'Pull quote', description: 'Optional call-out shown near the top of the story.' }
        ),
        sources: fields.array(
          fields.object({ title: fields.text({ label: 'Source', validation: { isRequired: true } }), url: fields.url({ label: 'URL' }) }),
          { label: 'Sources', itemLabel: (props) => props.fields.title.value || 'Source' }
        ),
        corrections: fields.array(
          fields.object({ date: fields.date({ label: 'Date', validation: { isRequired: true } }), note: fields.text({ label: 'What we fixed', multiline: true }) }),
          { label: 'Corrections', itemLabel: (props) => props.fields.note.value || 'Correction' }
        ),
        draft: fields.checkbox({ label: 'Draft', description: 'Keep this story off the site.' }),
        body: fields.markdoc({ label: 'Story', extension: 'md' }),
      },
    }),
  },
});
