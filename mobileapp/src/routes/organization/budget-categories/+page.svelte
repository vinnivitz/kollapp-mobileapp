<script lang="ts">
	import type { OrganizationBudgetCategoryRequestTO, OrganizationBudgetCategoryResponseTO } from '@kollapp/api-types';

	import { createOutline, trashOutline } from 'ionicons/icons';

	import { budgetCategorySchema } from '$lib/api/schema/budget-category';
	import { budgetCategoryService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import ToggleItem from '$lib/components/widgets/ionic/ToggleItem.svelte';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/tour';
	import { Form, type FormActions, type ItemSlidingOption } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { confirmationModal, customForm, StatusCheck } from '$lib/utility';

	const schema = budgetCategorySchema();
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

	const createForm = new Form<OrganizationBudgetCategoryRequestTO>({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			createModalOpen = false;
			actions.setModel(schema.getDefault());
		},
		exposedActions: (actions) => (createFormActions = actions),
		request: async (model) => budgetCategoryService.create($organizationStore?.id!, model),
		schema
	});

	const updateForm = new Form<OrganizationBudgetCategoryRequestTO>({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			updateModalOpen = false;
			actions.setModel(schema.getDefault());
		},
		exposedActions: (actions) => (updateFormActions = actions),
		request: async (model) => {
			return budgetCategoryService.update($organizationStore?.id!, selectedCategory!.id, model);
		},
		schema
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
		updateFormActions?.setModel({
			defaultCategory: category.defaultCategory,
			name: category.name
		});
		updateModalOpen = true;
	}

	async function onDeleteCategoryPrompt(category: OrganizationBudgetCategoryResponseTO): Promise<void> {
		return confirmationModal({
			handler: async () => await deleteCategory(category.id),
			header: $t('routes.organization.budget-categories.page.modal.delete.header'),
			message: $t('routes.organization.budget-categories.page.modal.delete.message', { value: category.name })
		});
	}

	async function deleteCategory(categoryId: number): Promise<void> {
		const response = await budgetCategoryService.remove($organizationStore?.id!, categoryId);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update($organizationStore?.id!);
		}
	}

	function onOpenCreateModal(): void {
		createFormActions?.setModel(schema.getDefault());
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
	/>
</Layout>

<!-- Snippets -->

{#snippet categoryList()}
	{#if categories.length > 0}
		<Card
			tourId={TourStepId.BUDGET_CATEGORIES.LIST}
			title={$t('routes.organization.budget-categories.page.category-list.card.title')}
		>
			<ion-list>
				{#each categories as category (category.id)}
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
				{/each}
			</ion-list>
		</Card>
	{:else}
		<Card>
			<ion-text color="medium" class="block text-center">
				{$t('routes.organization.budget-categories.page.empty')}
			</ion-text>
		</Card>
	{/if}
{/snippet}

{#snippet createModal()}
	<Modal open={createModalOpen} dismissed={() => (createModalOpen = false)}>
		<Card title={$t('routes.organization.budget-categories.page.modal.create.title')}>
			<form use:customForm={createForm}>
				<InputItem name="name" label={$t('routes.organization.budget-categories.page.form.name')} />
				<ToggleItem
					label={$t('routes.organization.budget-categories.page.form.default-category')}
					checked={createForm.model.defaultCategory}
					changed={(value) => createFormActions?.updateModelByKey('defaultCategory', value ?? false)}
				/>
			</form>
		</Card>
	</Modal>
{/snippet}

{#snippet updateModal()}
	<Modal open={updateModalOpen} dismissed={() => (updateModalOpen = false)}>
		<Card title={$t('routes.organization.budget-categories.page.modal.update.title')}>
			<form use:customForm={updateForm}>
				<InputItem name="name" label={$t('routes.organization.budget-categories.page.form.name')} />
				<ToggleItem
					label={$t('routes.organization.budget-categories.page.form.default-category')}
					checked={selectedCategory?.defaultCategory}
					disabled={selectedCategory?.defaultCategory}
					changed={(value) => updateFormActions?.updateModelByKey('defaultCategory', value ?? false)}
				/>
			</form>
		</Card>
	</Modal>
{/snippet}
