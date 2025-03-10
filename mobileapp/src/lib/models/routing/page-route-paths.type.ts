import type { PageRoute } from '$lib/models/routing';

/**
 * Type for all the routes in the application
 */
export type PageRoutePaths = ExtractPaths<typeof PageRoute> | string;

type ExtractPaths<T> = T extends string ? T : { [K in keyof T]: ExtractPaths<T[K]> }[keyof T];
