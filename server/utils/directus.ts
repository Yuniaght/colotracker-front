import { createDirectus, rest, staticToken } from '@directus/sdk';

export const useDirectusAdmin = () => {
  const config = useRuntimeConfig();
  const client = createDirectus(config.public.directusUrl)
    .with(rest())
    .with(staticToken(config.directusAdminToken));

  return client;
};