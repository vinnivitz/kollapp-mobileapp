import { get } from 'svelte/store';
import { type AnyObject, number, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';
import { BudgetPostingType } from '$lib/models/models';

/**
 * Data Transfer Object for updating a budget posting.
 */
export type UpdateBudgetPostingDto = {
	activityId: number;
	amountInCents: number;
	date: string;
	purpose: string;
	type: BudgetPostingType;
};

export const updateBudgetPostingSchema = (): ObjectSchema<AnyObject, UpdateBudgetPostingDto> => {
	const $t = get(t);
	return object<UpdateBudgetPostingDto>({
		activityId: string().default('').optional(),
		amountInCents: number()
			.default(0)
			.min(1, $t('api.dto.budget.update-posting.schema.amount.min'))
			.max(10_000_000, $t('api.dto.budget.update-posting.schema.amount.max'))
			.required($t('api.dto.budget.create-posting.schema.amount.required')),
		date: string().default(new Date().toISOString()).required($t('api.dto.budget.create-posting.schema.date.required')),
		purpose: string().default('').required($t('api.dto.budget.create-posting.schema.purpose.required')),
		type: string().oneOf(Object.values(BudgetPostingType)).default(BudgetPostingType.CREDIT)
	});
};
