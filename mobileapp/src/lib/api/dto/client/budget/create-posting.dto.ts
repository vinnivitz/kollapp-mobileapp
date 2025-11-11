import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { get } from 'svelte/store';
import { type AnyObject, number, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';
import { PostingType } from '$lib/models/models';

/**
 * Data Transfer Object for creating a posting.
 */
export type CreatePostingDto = {
	amountInCents: number;
	date: string;
	purpose: string;
	type: PostingType;
};

/**
 * Creates a schema for validating the `CreateAccountPostingDto`.
 * @returns {ObjectSchema<AnyObject, CreatePostingDto>} The schema for validating the `CreateAccountPostingDto`.
 */
export const createAccountPostingSchema = (): ObjectSchema<AnyObject, CreatePostingDto> => {
	const $t = get(t);
	return object<CreatePostingDto>({
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
		type: string().oneOf(Object.values(PostingType)).default(PostingType.CREDIT)
	});
};
