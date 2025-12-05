import type { PostingCreateUpdateRequestTO, PostingTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class BudgetResource {
	private base(organizationId: number): string {
		return `organization/${organizationId}`;
	}

	/**
	 * Adds a new organization posting.
	 * @param organizationId The organization ID.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The created posting.
	 */
	async createOrganizationPosting(
		organizationId: number,
		model: PostingCreateUpdateRequestTO
	): Promise<ResponseBody<PostingTO>> {
		return customFetch(`${this.base(organizationId)}/posting`, {
			body: model,
			method: RequestMethod.POST
		});
	}

	/**
	 * Adds a new activity posting.
	 * @param organizationId The organization ID.
	 * @param activityId The activity ID.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The created posting.
	 */
	async createActivityPosting(
		organizationId: number,
		activityId: number,
		model: PostingCreateUpdateRequestTO
	): Promise<ResponseBody<PostingTO>> {
		return customFetch(`${this.base(organizationId)}/${activityId}/posting`, {
			body: model,
			method: RequestMethod.POST
		});
	}

	/**
	 * Updates an existing activity posting by its ID.
	 * @param organizationId The organization ID.
	 * @param activityId The activity ID.
	 * @param postingId The posting ID.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The updated posting.
	 */
	async updateActivityPosting(
		organizationId: number,
		activityId: number,
		postingId: number,
		model: PostingCreateUpdateRequestTO
	): Promise<ResponseBody<PostingTO>> {
		return customFetch(`${this.base(organizationId)}/${activityId}/posting/${postingId}`, {
			body: model,
			method: RequestMethod.PUT
		});
	}

	/**
	 * Updates an existing organization posting by its ID.
	 * @param organizationId The organization ID.
	 * @param postingId The posting ID.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The updated posting.
	 */
	async updateOrganizationPosting(
		organizationId: number,
		postingId: number,
		model: PostingCreateUpdateRequestTO
	): Promise<ResponseBody<PostingTO>> {
		return customFetch(`${this.base(organizationId)}/posting/${postingId}`, {
			body: model,
			method: RequestMethod.PUT
		});
	}

	/**
	 * Deletes an organization posting by its ID.
	 * @param organizationId The organization ID.
	 * @param postingId The posting ID.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async removeOrganizationPosting(organizationId: number, postingId: number): Promise<ResponseBody> {
		return customFetch(`${this.base(organizationId)}/${organizationId}/posting/${postingId}`, {
			method: RequestMethod.DELETE
		});
	}

	/**
	 * Deletes an activity posting by its ID.
	 * @param organizationId The organization ID.
	 * @param activityId The activity ID.
	 * @param postingId The posting ID.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async removeActivityPosting(organizationId: number, activityId: number, postingId: number): Promise<ResponseBody> {
		return customFetch(`${this.base(organizationId)}/${activityId}/posting/${postingId}`, {
			method: RequestMethod.DELETE
		});
	}
}

export const budgetService = new BudgetResource();
