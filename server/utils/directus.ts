import { createDirectus, rest, staticToken } from '@directus/sdk';

const config = useRuntimeConfig();

export const useDirectusAdmin = () => {
  return createDirectus(config.public.directusUrl)
    .with(rest())
    .with(staticToken(config.directusAdminToken));;
};

export const useDirectusUser = (token: string) => {
  return createDirectus(config.public.directusUrl)
    .with(rest())
    .with(staticToken(token));
}