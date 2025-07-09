import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { get } from 'svelte/store';
import { type AnyObject, number, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';
import { AccountPostingType } from '$lib/models/models';

/**
 * Data Transfer Object for creating a account posting.
 */
export type CreateAccountPostingDto = {
	activityId: number;
	amountInCents: number;
	date: string;
	purpose: string;
	type: AccountPostingType;
};

/**
 * Creates a schema for validating the `CreateAccountPostingDto`.
 * @returns {ObjectSchema<AnyObject, CreateAccountPostingDto>} The schema for validating the `CreateAccountPostingDto`.
 */
export const createAccountPostingSchema = (): ObjectSchema<AnyObject, CreateAccountPostingDto> => {
	const $t = get(t);
	return object<CreateAccountPostingDto>({
		activityId: string().default(''),
		amountInCents: number()
			.default(0)
			.min(1, $t('api.dto.budget.create-posting.schema.amount.min'))
			.max(10_000_000, $t('api.dto.budget.create-posting.schema.amount.max'))
			.required($t('api.dto.budget.create-posting.schema.amount.required')),
		date: string()
			.default(format(new TZDate(), 'yyyy-MM-dd'))
			.required($t('api.dto.budget.create-posting.schema.date.required')),
		purpose: string()
			.default('')
			.trim()
			.max(200, $t('api.dto.budget.create-posting.schema.purpose.max'))
			.required($t('api.dto.budget.create-posting.schema.purpose.required')),
		type: string().oneOf(Object.values(AccountPostingType)).default(AccountPostingType.CREDIT)
	});
};
