import type { OrganizationBudgetCategoryRequestTO, OrganizationTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { organizationStore } from '$lib/stores';
import { customFetch, getOrganizationId, StatusCheck } from '$lib/utility';

/**
 * Service for managing budget categories within an organization.
 * Budget categories are used to classify postings for better organization and reporting.
 */
class BudgetCategoryService {
	private get base(): string {
		return `organization/${getOrganizationId()!}/budget-category`;
	}

	/**
	 * Creates a new budget category for the organization.
	 * Only organization managers are allowed to create categories.
	 * @param model The budget category data.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The updated organization with the new category.
	 */
	async create(model: OrganizationBudgetCategoryRequestTO): Promise<ResponseBody<OrganizationTO>> {
		const response = await customFetch<OrganizationTO>(this.base, {
			body: model,
			method: RequestMethod.POST
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.set(response.data);
		}
		return response;
	}

	/**
	 * Updates an existing budget category.
	 * Only organization managers are allowed to update categories.
	 * Note: The default flag cannot be revoked, only transferred to another category.
	 * @param categoryId The category ID to update.
	 * @param model The updated budget category data.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The updated organization with the modified category.
	 */
	async update(categoryId: number, model: OrganizationBudgetCategoryRequestTO): Promise<ResponseBody<OrganizationTO>> {
		const response = await customFetch<OrganizationTO>(`${this.base}/${categoryId}`, {
			body: model,
			method: RequestMethod.PUT
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.set(response.data);
		}
		return response;
	}

	/**
	 * Deletes a budget category from the organization.
	 * Only organization managers are allowed to delete categories.
	 * Note: The default category cannot be deleted.
	 * @param categoryId The category ID to delete.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The updated organization without the deleted category.
	 */
	async remove(categoryId: number): Promise<ResponseBody<OrganizationTO>> {
		const response = await customFetch<OrganizationTO>(`${this.base}/${categoryId}`, {
			method: RequestMethod.DELETE
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.set(response.data);
		}
		return response;
	}
}

export const budgetCategoryService = new BudgetCategoryService();
