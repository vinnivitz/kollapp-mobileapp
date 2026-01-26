import type { AuthorizationType, RequestMethod, StatusCode } from '$lib/models/api';

/**
 * Custom fetch configuration
 */
export type CustomFetchConfig =
	| (BaseCustomFetchConfig & {
			body?: never;
			method?: RequestMethod.GET;
	  })
	| (BaseCustomFetchConfig & {
			method: RequestMethod.DELETE | RequestMethod.PATCH | RequestMethod.POST | RequestMethod.PUT;
			body?: object;
	  });

type BaseCustomFetchConfig = {
	authorizationType?: AuthorizationType;
	query?: Record<string, string>;
	silentOnError?: boolean;
	silentOnStatus?: StatusCode[];
	silentOnSuccess?: boolean;
};
