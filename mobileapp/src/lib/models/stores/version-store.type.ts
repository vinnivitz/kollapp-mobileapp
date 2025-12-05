import type { BaseStore } from '$lib/models/stores';
import type { ApiVersionTO } from '@kollapp/api-types';

/**
 * Store for version information.
 */
export type VersionStore = BaseStore<ApiVersionTO>;
