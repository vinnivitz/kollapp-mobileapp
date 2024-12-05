import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

export type EmailDto = {
	email: string;
};

export const emailSchema = (): ObjectSchema<AnyObject, EmailDto> => {
	const $t = get(t);
	return object<EmailDto>({
		email: string()
			.default('')
			.email($t('api.dto.email.schema.validation.invalid'))
			.required($t('api.dto.email.schema.validation.required'))
	});
};
