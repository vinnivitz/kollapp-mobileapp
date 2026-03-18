import type { OrganizationBudgetCategoryRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, boolean, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a validation schema for budget category creation and update requests.
 * Validates the category name (required, max 50 chars) and the default flag (required boolean).
 * @returns The Yup validation schema for OrganizationBudgetCategoryRequestTO.
 */
export const budgetCategorySchema = (): ObjectSchema<OrganizationBudgetCategoryRequestTO> => {
	const $t = get(t);
	return object({
		defaultCategory: boolean().default(false).required($t('api.validation.budget-category.default-category.required')),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.budget-category.name.max'))
			.required($t('api.validation.budget-category.name.required'))
	} satisfies Record<keyof OrganizationBudgetCategoryRequestTO, AnyObject>);
};
