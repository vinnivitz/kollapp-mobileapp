import type { PostingCreateUpdateRequestTO, PostingType } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { get } from 'svelte/store';
import { type AnyObject, number, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';
import { formatter } from '$lib/utility';

/**
 * Creates a schema for validating the `PostingCreateUpdateRequestTO`.
 * @returns {ObjectSchema<PostingCreateUpdateRequestTO>} The schema for validating the `PostingCreateUpdateRequestTO`.
 */
export const createUpdatePostingSchema = (
	model?: Partial<PostingCreateUpdateRequestTO>
): ObjectSchema<PostingCreateUpdateRequestTO> => {
	const $t = get(t);
	const types = Object.values({ CREDIT: 'CREDIT', DEBIT: 'DEBIT' } satisfies Record<PostingType, PostingType>);

	return object({
		amountInCents: number()
			.default(model?.amountInCents ?? 0)
			.positive($t('api.validation.budget.create-posting.amount.min'))
			.max(10_000_000, $t('api.validation.budget.create-posting.amount.max'))
			.required($t('api.validation.budget.create-posting.amount.required')),
		date: string()
			.default(model?.date ?? formatter.date(new TZDate(), 'yyyy-MM-dd'))
			.required($t('api.validation.budget.create-posting.date.required')),
		organizationBudgetCategoryId: number()
			.min(0)
			.default(model?.organizationBudgetCategoryId ?? 0),
		personOfOrganizationId: number()
			.min(0)
			.default(model?.personOfOrganizationId ?? 0),
		purpose: string()
			.default('')
			.trim()
			.max(200, $t('api.validation.budget.create-posting.purpose.max'))
			.required($t('api.validation.budget.create-posting.purpose.required')),
		type: string()
			.oneOf(Object.values(types))
			.default(model?.type ?? 'DEBIT')
	} satisfies Record<keyof PostingCreateUpdateRequestTO, AnyObject>);
};
