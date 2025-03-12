import type { AuthorizationType, RequestMethod } from '$lib/models/api';

/**
 * Custom fetch configuration
 */
export type CustomFetchConfig =
	| {
			authorizationType?: AuthorizationType;
			body?: never;
			method?: RequestMethod.GET | RequestMethod.DELETE;
			query?: Record<string, string>;
			silentOnError?: boolean;
			silentOnSuccess?: boolean;
	  }
	| {
			authorizationType?: AuthorizationType;
			body: string;
			method: RequestMethod.POST | RequestMethod.PUT;
			query?: Record<string, string>;
			silentOnError?: boolean;
			silentOnSuccess?: boolean;
	  };
