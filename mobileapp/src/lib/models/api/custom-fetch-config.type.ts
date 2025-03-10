import type { AuthorizationType, RequestMethod } from '$lib/models/api';

/**
 * Custom fetch configuration
 */
export type CustomFetchConfig =
	| {
			method?: RequestMethod.GET | RequestMethod.DELETE;
			body?: never;
			query?: Record<string, string>;
			authorizationType?: AuthorizationType;
			silentOnSuccess?: boolean;
			silentOnError?: boolean;
	  }
	| {
			method: RequestMethod.POST | RequestMethod.PUT;
			body: string;
			query?: Record<string, string>;
			authorizationType?: AuthorizationType;
			silentOnSuccess?: boolean;
			silentOnError?: boolean;
	  };
