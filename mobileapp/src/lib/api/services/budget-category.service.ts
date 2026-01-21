import type { OrganizationBudgetCategoryRequestTO, OrganizationTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

/**
 * Service for managing budget categories within an organization.
 * Budget categories are used to classify postings for better organization and reporting.
 */
class BudgetCategoryResource {
	/**
	 * Constructs the base URL for budget category endpoints.
	 * @param organizationId The organization ID.
	 * @returns The base URL for budget category operations.
	 */
	private base(organizationId: number): string {
		return `organization/${organizationId}/budget-category`;
	}

	/**
	 * Creates a new budget category for the organization.
	 * Only organization managers are allowed to create categories.
	 * @param organizationId The organization ID.
	 * @param model The budget category data.
	 * @returns The updated organization with the new category.
	 */
	async create(
		organizationId: number,
		model: OrganizationBudgetCategoryRequestTO
	): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(this.base(organizationId), {
			body: model,
			method: RequestMethod.POST
		});
	}

	/**
	 * Updates an existing budget category.
	 * Only organization managers are allowed to update categories.
	 * Note: The default flag cannot be revoked, only transferred to another category.
	 * @param organizationId The organization ID.
	 * @param categoryId The category ID to update.
	 * @param model The updated budget category data.
	 * @returns The updated organization with the modified category.
	 */
	async update(
		organizationId: number,
		categoryId: number,
		model: OrganizationBudgetCategoryRequestTO
	): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.base(organizationId)}/${categoryId}`, {
			body: model,
			method: RequestMethod.PUT
		});
	}

	/**
	 * Deletes a budget category from the organization.
	 * Only organization managers are allowed to delete categories.
	 * Note: The default category cannot be deleted.
	 * @param organizationId The organization ID.
	 * @param categoryId The category ID to delete.
	 * @returns The updated organization without the deleted category.
	 */
	async remove(organizationId: number, categoryId: number): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.base(organizationId)}/${categoryId}`, {
			method: RequestMethod.DELETE
		});
	}
}

export const budgetCategoryService = new BudgetCategoryResource();
