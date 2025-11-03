import type { CreateAccountPostingDto } from '$lib/api/dto/client/accounting';
import type { BudgetAccountDto } from '../dto/server/accounting';
import type { AccountPostingDto } from '../dto/server/accounting/account-posting.dto';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'budget/account';

/**
 * Adds a new account posting to the specified account.
 * @param accountId The ID of the account to which the account posting will be added, if 0 its added as organization posting.
 * @param model The data for the new account posting.
 * @returns {Promise<ResponseBody<AccountPostingDto>>} The response containing the created account posting.
 */
async function add(accountId: number, model: CreateAccountPostingDto): Promise<ResponseBody<AccountPostingDto>> {
	return customFetch(`${ENDPOINT}/${accountId}/posting`, {
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Updates an existing account posting by its ID.
 * @param accountId The ID of the account to which the account posting belongs, if 0 its organization posting.
 * @param postingId The ID of the account posting to update.
 * @param model The updated data for the account posting.
 * @returns {Promise<ResponseBody<AccountPostingDto>>} The response containing the updated account posting.
 */
async function update(
	accountId: number,
	postingId: number,
	model: CreateAccountPostingDto
): Promise<ResponseBody<AccountPostingDto>> {
	return customFetch(`${ENDPOINT}/${accountId}/posting/${postingId}`, {
		body: JSON.stringify(model),
		method: RequestMethod.PUT
	});
}

/**
 * Retrieves all account postings for the specified account.
 * @param organizationId The ID of the organization for which to retrieve account postings, if 0 its organization postings.
 * @returns {Promise<ResponseBody<AccountAccountDto>>} The response containing the list of account postings.
 */
async function getAllByOrganizationId(organizationId: number): Promise<ResponseBody<BudgetAccountDto>> {
	return customFetch(`${ENDPOINT}?organization-id=${organizationId}`, { silentOnSuccess: true });
}

/**
 * Deletes a account posting by its ID.
 * @param accountId The ID of the account from which the account posting will be deleted, if 0 its organization posting.
 * @param postingId The ID of the account posting to delete.
 * @returns {Promise<ResponseBody>} The response indicating the result of the deletion.
 */
async function remove(accountId: number, postingId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${accountId}/posting/${postingId}`, {
		method: RequestMethod.DELETE
	});
}

export const accountingResource = {
	add,
	getAllByOrganizationId,
	remove,
	update
};
