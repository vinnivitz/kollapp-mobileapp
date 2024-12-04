import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

export type LoginDto = {
	username: string;
	password: string;
};

export const loginSchema = (): ObjectSchema<AnyObject, LoginDto> => {
	const $t = get(t);
	return object<LoginDto>({
		username: string()
			.default('')
			.min(2, $t('api.dto.login.schema.validation.username.min'))
			.max(255, $t('api.dto.login.schema.validation.username.max'))
			.required($t('api.dto.login.schema.validation.username.required')),
		password: string()
			.default('')
			.min(8, $t('api.dto.login.schema.validation.password.min'))
			.max(255, $t('api.dto.login.schema.validation.password.max'))
			.matches(
				/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
				$t('api.dto.login.schema.validation.password.matches')
			)
			.required($t('api.dto.login.schema.validation.password.required'))
	});
};
