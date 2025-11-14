import type { LoadableStore } from '$lib/models/stores';
import type { KollappUserTO } from '@kollapp/api-types';

/**
 * Store for user information.
 */
export type UserStore = LoadableStore<KollappUserTO>;
