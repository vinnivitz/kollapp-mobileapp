import type { PostingCreateUpdateRequestTO, PostingType } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { get } from 'svelte/store';
import { type AnyObject, number, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `PostingCreateUpdateRequestTO`.
 * @returns {ObjectSchema<PostingCreateUpdateRequestTO>} The schema for validating the `PostingCreateUpdateRequestTO`.
 */
export const createPostingSchema = (): ObjectSchema<PostingCreateUpdateRequestTO> => {
	const $t = get(t);
	const types = Object.values({ CREDIT: 'CREDIT', DEBIT: 'DEBIT' } satisfies Record<PostingType, PostingType>);

	return object({
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
		type: string().oneOf(Object.values(types)).default('CREDIT')
	} satisfies Record<keyof PostingCreateUpdateRequestTO, AnyObject>);
};
