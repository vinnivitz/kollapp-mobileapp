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
export const createUpdatePostingSchema = (): ObjectSchema<PostingCreateUpdateRequestTO> => {
	const $t = get(t);
	const types = Object.values({ CREDIT: 'CREDIT', DEBIT: 'DEBIT' } satisfies Record<PostingType, PostingType>);

	return object({
		amountInCents: number()
			.default(0)
			.positive($t('api.validation.budget.create-posting.amount.min'))
			.max(10_000_000, $t('api.validation.budget.create-posting.amount.max'))
			.required($t('api.validation.budget.create-posting.amount.required')),
		date: string()
			.default(format(new TZDate(), 'yyyy-MM-dd'))
			.required($t('api.validation.budget.create-posting.date.required')),
		organizationBudgetCategoryId: number().min(0).optional().default(0),
		personOfOrganizationId: number().min(0).optional().default(0),
		purpose: string()
			.default('')
			.trim()
			.max(200, $t('api.validation.budget.create-posting.purpose.max'))
			.required($t('api.validation.budget.create-posting.purpose.required')),
		type: string().oneOf(Object.values(types)).default('CREDIT')
	} satisfies Record<keyof PostingCreateUpdateRequestTO, AnyObject>);
};
