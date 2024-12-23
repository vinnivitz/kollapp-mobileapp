/**
 * Authentication token model for access and refresh tokens.
 */
export type AuthenticationTokenModel = {
	accessToken: string;
	refreshToken: string;
};

/**
 * Organization and authentication token model for retrieving authentication tokens and  basic organization information.
 */
export type OrganizationTokenModel = OrganizationModel & AuthenticationTokenModel;

/**
 * Organization model for storing basic organization information.
 */
export type OrganizationModel = {
	username: string;
	email: string;
};

/**
 * Token model for jwt a token.
 */
export type TokenModel = {
	token: string;
};
