import type { AuthorizationType, RequestMethod } from '$lib/models/api';

/**
 * Custom fetch configuration
 */
export type CustomFetchConfig =
	| {
			authorizationType?: AuthorizationType;
			body?: never;
			method?: RequestMethod.DELETE | RequestMethod.GET;
			query?: Record<string, string>;
			silentOnError?: boolean;
			silentOnSuccess?: boolean;
	  }
	| {
			body: string;
			method: RequestMethod.POST | RequestMethod.PUT;
			authorizationType?: AuthorizationType;
			query?: Record<string, string>;
			silentOnError?: boolean;
			silentOnSuccess?: boolean;
	  };
