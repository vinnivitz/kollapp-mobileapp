import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { get } from 'svelte/store';
import { type AnyObject, number, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';
import { PostingType } from '$lib/models/models';

/**
 * Data Transfer Object for updating a posting.
 */
export type UpdatePostingDto = {
	amountInCents: number;
	date: string;
	purpose: string;
	type: PostingType;
};

/**
 * Creates a schema for validating the `UpdatePostingDto`.
 * @returns schema for validating the `UpdatePostingDto`.
 */
export const updatePostingSchema = (): ObjectSchema<AnyObject, UpdatePostingDto> => {
	const $t = get(t);
	return object<UpdatePostingDto>({
		activityId: string().default('').optional(),
		amountInCents: number()
			.default(0)
			.min(1, $t('api.dto.budget.update-posting.schema.amount.min'))
			.max(10_000_000, $t('api.dto.budget.update-posting.schema.amount.max'))
			.required($t('api.dto.budget.create-posting.schema.amount.required')),
		date: string()
			.default(format(new TZDate(), 'yyyy-MM-dd'))
			.required($t('api.dto.budget.create-posting.schema.date.required')),
		purpose: string().default('').required($t('api.dto.budget.create-posting.schema.purpose.required')),
		type: string().oneOf(Object.values(PostingType)).default(PostingType.CREDIT)
	});
};
