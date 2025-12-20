import type { AuthorizationType, RequestMethod, StatusCode } from '$lib/models/api';

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
			silentOnSpecificStatus?: StatusCode[];
			silentOnSuccess?: boolean;
	  }
	| {
			method: RequestMethod.PATCH | RequestMethod.POST | RequestMethod.PUT;
			authorizationType?: AuthorizationType;
			body?: object;
			query?: Record<string, string>;
			silentOnError?: boolean;
			silentOnSpecificStatus?: StatusCode[];
			silentOnSuccess?: boolean;
	  };
