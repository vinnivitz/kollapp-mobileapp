import type { CreateBudgetPostingDto } from '$lib/api/dto/client/budget';
import type { BudgetAccountDto } from '../dto/server/budget';
import type { BudgetPostingDto } from '../dto/server/budget/budget-posting.dto';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'budget/account';

/**
 * Adds a new budget posting to the specified account.
 * @param accountId The ID of the account to which the budget posting will be added, if 0 its added as organization posting.
 * @param model The data for the new budget posting.
 * @returns {Promise<ResponseBody<BudgetPostingDto>>} The response containing the created budget posting.
 */
export async function addBudgetPosting(
	accountId: number,
	model: CreateBudgetPostingDto
): Promise<ResponseBody<BudgetPostingDto>> {
	return customFetch(`${ENDPOINT}/${accountId}/posting`, {
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Retrieves all budget postings for the specified account.
 * @param organizationId The ID of the organization for which to retrieve budget postings, if 0 its organization postings.
 * @returns {Promise<ResponseBody<BudgetAccountDto>>} The response containing the list of budget postings.
 */
export async function getBudgetPostings(organizationId: number): Promise<ResponseBody<BudgetAccountDto>> {
	return customFetch(`${ENDPOINT}?organization-id=${organizationId}`, { silentOnSuccess: true });
}

/**
 * Deletes a budget posting by its ID.
 * @param accountId The ID of the account from which the budget posting will be deleted, if 0 its organization posting.
 * @param postingId The ID of the budget posting to delete.
 * @returns {Promise<ResponseBody>} The response indicating the result of the deletion.
 */
export async function deleteBudgetPosting(accountId: number, postingId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${accountId}/posting/${postingId}`, {
		method: RequestMethod.DELETE
	});
}
