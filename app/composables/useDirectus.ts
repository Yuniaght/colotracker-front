import { createDirectus, rest, authentication } from '@directus/sdk';

export const useDirectus = () => {
  const config = useRuntimeConfig();

  const directus = createDirectus(config.public.directusUrl as string)
    .with(authentication('json', { autoRefresh: true }))
    .with(rest());

  return directus;
};