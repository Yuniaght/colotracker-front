import { createDirectus, rest, staticToken } from '@directus/sdk';
import type { Schema } from '~~/shared/types/directus';

const config = useRuntimeConfig();

export const useDirectusAdmin = () => {
  return createDirectus<Schema>(config.public.directusUrl)
    .with(rest())
    .with(staticToken(config.directusAdminToken));;
};

export const useDirectusUser = (token: string) => {
  return createDirectus<Schema>(config.public.directusUrl)
    .with(rest())
    .with(staticToken(token));
}