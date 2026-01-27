import type { ActivityCreationRequestTO, ActivityTO, ActivityUpdateRequestTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { organizationStore } from '$lib/stores';
import { customFetch, getOrganizationId, StatusCheck } from '$lib/utility';

class ActivityService {
	private get base(): string {
		return `organization/${getOrganizationId()!}`;
	}

	/**
	 * Creates a new activity for the given organization.
	 * @param model activity model
	 * @returns {Promise<ResponseBody<ActivityTO>>} The created activity.
	 */
	create = async (model: ActivityCreationRequestTO): Promise<ResponseBody<ActivityTO>> => {
		const response = await customFetch<ActivityTO>(`${this.base}/activity`, {
			body: model,
			method: RequestMethod.POST
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.createActivity(response.data);
		}
		return response;
	};

	/**
	 * Updates the activity of the given organization.
	 * @param activityId id of the activity
	 * @param model activity model
	 * @returns {Promise<ResponseBody<ActivityTO>>} The updated activity.
	 */
	update = async (activityId: number, model: ActivityUpdateRequestTO): Promise<ResponseBody<ActivityTO>> => {
		const response = await customFetch<ActivityTO>(`${this.base}/activity/${activityId}`, {
			body: model,
			method: RequestMethod.PUT
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.updateActivity(response.data);
		}
		return response;
	};

	/**
	 * Deletes the activity of the given organization.
	 * @param activityId id of the activity
	 * @returns {Promise<ResponseBody>} response body
	 */
	remove = async (activityId: number): Promise<ResponseBody> => {
		const response = await customFetch(`${this.base}/activity/${activityId}`, {
			method: RequestMethod.DELETE
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.removeActivity(activityId);
		}
		return response;
	};
}

export const activityService = new ActivityService();
