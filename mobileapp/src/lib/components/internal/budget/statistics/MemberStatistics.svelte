<script lang="ts">
	import type { PersonOfOrganizationTO, PostingTO } from '@kollapp/api-types';

	import { peopleOutline, personOutline } from 'ionicons/icons';

	import { Card, CustomItem } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		personsOfOrganization: PersonOfOrganizationTO[];
		postings: PostingTO[];
	};

	type PersonOfOrganizationStats = { credit: number; debit: number; personOfOrganization: PersonOfOrganizationTO };

	let { personsOfOrganization, postings }: Properties = $props();

	const statistics = $derived.by<PersonOfOrganizationStats[]>(() => {
		return personsOfOrganization
			.map((personOfOrganization) => {
				const personOfOrganizationPostings = postings.filter(
					(posting) => posting.personOfOrganizationId === personOfOrganization.id
				);
				return {
					credit: personOfOrganizationPostings
						.filter((posting) => posting.type === 'CREDIT')
						.reduce((sum, posting) => sum + posting.amountInCents, 0),
					debit: personOfOrganizationPostings
						.filter((posting) => posting.type === 'DEBIT')
						.reduce((sum, posting) => sum + posting.amountInCents, 0),
					personOfOrganization
				};
			})
			.filter((stats) => stats.credit > 0 || stats.debit > 0)
			.toSorted((a, b) => b.debit + b.credit - (a.debit + a.credit));
	});
</script>

<Card titleIconStart={peopleOutline} title={$t('routes.organization.budget-statistics.page.members.title')}>
	{#each statistics.slice(0, 5) as statistic (statistic.personOfOrganization.id)}
		<CustomItem icon={personOutline}>
			<div class="flex w-full flex-row items-center justify-between gap-2">
				<div class="flex flex-1 flex-col">
					<ion-text>{statistic.personOfOrganization.username}</ion-text>
					<div class="flex gap-4 text-sm">
						<ion-text color="success">+{formatter.currency(statistic.credit)}</ion-text>
						<ion-text color="danger">-{formatter.currency(statistic.debit)}</ion-text>
					</div>
				</div>
				<ion-text class="font-bold" color={statistic.credit - statistic.debit >= 0 ? 'success' : 'danger'}>
					{formatter.currency(statistic.credit - statistic.debit)}
				</ion-text>
			</div>
		</CustomItem>
	{/each}
</Card>
