import type { PostingCreateUpdateRequestTO, PostingTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { organizationStore } from '$lib/stores';
import { customFetch, getOrganizationId, StatusCheck } from '$lib/utility';

class BudgetService {
	private get base(): string {
		return `organization/${getOrganizationId()!}`;
	}

	/**
	 * Adds a new organization posting.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The created posting.
	 */
	createOrganizationPosting = async (model: PostingCreateUpdateRequestTO): Promise<ResponseBody<PostingTO>> => {
		const response = await customFetch<PostingTO>(`${this.base}/posting`, {
			body: model,
			method: RequestMethod.POST
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.createOrganizationPosting(response.data);
		}
		return response;
	};

	/**
	 * Adds a new activity posting.
	 * @param activityId The activity ID.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The created posting.
	 */
	createActivityPosting = async (
		activityId: number,
		model: PostingCreateUpdateRequestTO
	): Promise<ResponseBody<PostingTO>> => {
		const response = await customFetch<PostingTO>(`${this.base}/activity/${activityId}/posting`, {
			body: model,
			method: RequestMethod.POST
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.createActivityPosting(activityId, response.data);
		}
		return response;
	};

	/**
	 * Updates an existing activity posting by its ID.
	 * @param activityId The activity ID.
	 * @param postingId The posting ID.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The updated posting.
	 */
	updateActivityPosting = async (
		activityId: number,
		postingId: number,
		model: PostingCreateUpdateRequestTO
	): Promise<ResponseBody<PostingTO>> => {
		const response = await customFetch<PostingTO>(`${this.base}/activity/${activityId}/posting/${postingId}`, {
			body: model,
			method: RequestMethod.PUT
		});
		if (StatusCheck.isOK(response.status)) {
			console.log('response', response.data);
			await organizationStore.updateActivityPosting(activityId, response.data);
		}
		return response;
	};

	/**
	 * Updates an existing organization posting by its ID.
	 * @param postingId The posting ID.
	 * @param model The posting model.
	 * @returns {Promise<ResponseBody<PostingTO>>} The updated posting.
	 */
	updateOrganizationPosting = async (
		postingId: number,
		model: PostingCreateUpdateRequestTO
	): Promise<ResponseBody<PostingTO>> => {
		const response = await customFetch<PostingTO>(`${this.base}/posting/${postingId}`, {
			body: model,
			method: RequestMethod.PUT
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.updateOrganizationPosting(response.data);
		}
		return response;
	};

	/**
	 * Deletes an organization posting by its ID.
	 * @param postingId The posting ID.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	deleteOrganizationPosting = async (postingId: number): Promise<ResponseBody> => {
		const response = await customFetch(`${this.base}/posting/${postingId}`, {
			method: RequestMethod.DELETE
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.removeOrganizationPosting(postingId);
		}
		return response;
	};

	/**
	 * Deletes an activity posting by its ID.
	 * @param activityId The activity ID.
	 * @param postingId The posting ID.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	deleteActivityPosting = async (activityId: number, postingId: number): Promise<ResponseBody> => {
		const response = await customFetch(`${this.base}/activity/${activityId}/posting/${postingId}`, {
			method: RequestMethod.DELETE
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.removeActivityPosting(activityId, postingId);
		}
		return response;
	};

	/**
	 * Transfers an organization posting to the collective.
	 * This removes the assignment to a specific person of organization.
	 * Only managers can transfer postings.
	 * @param postingId The posting ID.
	 * @returns {Promise<ResponseBody<PostingTO>>} The transferred posting.
	 */
	transferOrganizationPosting = async (postingId: number): Promise<ResponseBody<PostingTO>> => {
		const response = await customFetch<PostingTO>(`${this.base}/posting/${postingId}`, {
			method: RequestMethod.PATCH
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.updateOrganizationPosting(response.data);
		}
		return response;
	};

	/**
	 * Transfers an activity posting to the collective.
	 * This removes the assignment to a specific person of organization.
	 * Only managers can transfer postings.
	 * @param activityId The activity ID.
	 * @param postingId The posting ID.
	 * @returns {Promise<ResponseBody<PostingTO>>} The transferred posting.
	 */
	transferActivityPosting = async (activityId: number, postingId: number): Promise<ResponseBody<PostingTO>> => {
		const response = await customFetch<PostingTO>(`${this.base}/activity/${activityId}/posting/${postingId}`, {
			method: RequestMethod.PATCH
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.updateActivityPosting(activityId, response.data);
		}
		return response;
	};
}

export const budgetService = new BudgetService();
