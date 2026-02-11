<script lang="ts">
	import type { OrganizationBudgetCategoryRequestTO, OrganizationBudgetCategoryResponseTO } from '@kollapp/api-types';

	import { cardOutline, createOutline, starOutline, trashOutline } from 'ionicons/icons';

	import { budgetCategorySchema } from '$lib/api/schemas/budget';
	import { budgetCategoryService } from '$lib/api/services';
	import { Card, CustomItem, FabButton, InputItem, Modal, ToggleItem } from '$lib/components/core';
	import { FadeInOut } from '$lib/components/core/animation';
	import { Layout } from '$lib/components/layout';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type ItemSlidingOption, TourStepId } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { confirmationModal, customForm, withLoader } from '$lib/utility';

	const categories = $derived(
		($organizationStore?.budgetCategories ?? []).toSorted((a, b) => {
			if (a.defaultCategory && !b.defaultCategory) {
				return -1;
			}
			if (!a.defaultCategory && b.defaultCategory) {
				return 1;
			}
			return a.name.localeCompare(b.name);
		})
	);

	let createModalOpen = $state<boolean>(false);
	let updateModalOpen = $state<boolean>(false);
	let selectedCategory = $state<OrganizationBudgetCategoryResponseTO>();

	let createFormActions = $state<FormActions<OrganizationBudgetCategoryRequestTO>>();
	let updateFormActions = $state<FormActions<OrganizationBudgetCategoryRequestTO>>();

	const createForm = new Form({
		actions: (actions) => (createFormActions = actions),
		completed: async ({ actions }) => {
			createModalOpen = false;
			actions.set(budgetCategorySchema().getDefault());
		},
		failed: () => (createModalOpen = false),
		request: budgetCategoryService.create,
		schema: budgetCategorySchema()
	});

	const updateForm = new Form({
		actions: (actions) => (updateFormActions = actions),
		completed: async ({ actions }) => {
			updateModalOpen = false;
			actions.set(budgetCategorySchema().getDefault());
		},
		failed: () => (updateModalOpen = false),
		request: async (model) => budgetCategoryService.update(selectedCategory?.id!, model),
		schema: budgetCategorySchema()
	});

	function getSlidingOptions(category: OrganizationBudgetCategoryResponseTO): ItemSlidingOption[] {
		const options: ItemSlidingOption[] = [
			{
				color: 'primary',
				handler: () => onEditCategory(category),
				icon: createOutline,
				label: $t('routes.organization.budget-categories.page.sliding-options.edit')
			}
		];
		if (!category.defaultCategory) {
			options.push({
				color: 'danger',
				handler: () => onDeleteCategoryPrompt(category),
				icon: trashOutline,
				label: $t('routes.organization.budget-categories.page.sliding-options.delete')
			});
		}
		return options;
	}

	function onEditCategory(category: OrganizationBudgetCategoryResponseTO): void {
		selectedCategory = category;
		updateFormActions?.set({
			defaultCategory: category.defaultCategory,
			name: category.name
		});
		updateModalOpen = true;
	}

	async function onDeleteCategoryPrompt(category: OrganizationBudgetCategoryResponseTO): Promise<void> {
		return confirmationModal({
			handler: async () => void withLoader(() => budgetCategoryService.remove(category.id)),
			header: $t('routes.organization.budget-categories.page.modal.delete.header'),
			message: $t('routes.organization.budget-categories.page.modal.delete.message', { value: category.name })
		});
	}

	function onOpenCreateModal(): void {
		createFormActions?.set(budgetCategorySchema().getDefault());
		createModalOpen = true;
	}
</script>

<Layout title={$t('routes.organization.budget-categories.page.title')} showBackButton>
	{@render categoryList()}
	{@render createModal()}
	{@render updateModal()}
	<FabButton
		tourId={TourStepId.BUDGET_CATEGORIES.ADD}
		indexed="/organization/budget-categories"
		indexLabel={$t('routes.organization.budget-categories.page.budget-categories-card.card.add-category')}
		icon={createOutline}
		clicked={onOpenCreateModal}
		accessible="ROLE_ORGANIZATION_MANAGER"
	/>
</Layout>

<!-- Snippets -->

{#snippet categoryList()}
	<Card tourId={TourStepId.BUDGET_CATEGORIES.LIST}>
		<ion-list>
			{#each categories as category (category.id)}
				<FadeInOut>
					<CustomItem
						iconColor={category.defaultCategory ? 'success' : 'medium'}
						slidingOptions={getSlidingOptions(category)}
					>
						<ion-label>{category.name}</ion-label>
						{#if category.defaultCategory}
							<ion-badge color="success">
								{$t('routes.organization.budget-categories.page.default-badge')}
							</ion-badge>
						{/if}
					</CustomItem>
				</FadeInOut>
			{/each}
		</ion-list>
	</Card>
{/snippet}

{#snippet createModal()}
	<Modal open={createModalOpen} dismissed={() => (createModalOpen = false)}>
		<Card title={$t('routes.organization.budget-categories.page.modal.create.title')}>
			<form use:customForm={createForm}>
				<InputItem icon={cardOutline} name="name" label={$t('routes.organization.budget-categories.page.form.name')} />
				<ToggleItem
					icon={starOutline}
					label={$t('routes.organization.budget-categories.page.form.default-category')}
					checked={false}
					changed={(value) => createFormActions?.patchByKey('defaultCategory', value ?? false)}
				/>
			</form>
		</Card>
	</Modal>
{/snippet}

{#snippet updateModal()}
	<Modal open={updateModalOpen} dismissed={() => (updateModalOpen = false)}>
		<Card title={$t('routes.organization.budget-categories.page.modal.update.title')}>
			<form use:customForm={updateForm}>
				<InputItem icon={cardOutline} name="name" label={$t('routes.organization.budget-categories.page.form.name')} />
				{#key selectedCategory}
					<ToggleItem
						icon={starOutline}
						label={$t('routes.organization.budget-categories.page.form.default-category')}
						checked={selectedCategory?.defaultCategory}
						disabled={selectedCategory?.defaultCategory}
						changed={(value) => updateFormActions?.patchByKey('defaultCategory', value ?? false)}
					/>
				{/key}
			</form>
		</Card>
	</Modal>
{/snippet}
