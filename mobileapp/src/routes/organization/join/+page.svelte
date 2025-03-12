<script lang="ts">
	import { keyOutline, qrCodeOutline, saveOutline } from 'ionicons/icons';
	import { object, ObjectSchema } from 'yup';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormConfig } from '$lib/models/ui';
	import { customForm, showAlert } from '$lib/utils';

	const config: FormConfig<object> = {
		schema: new ObjectSchema(),
		onSubmit
	};

	const form = new Form(object, config);

	async function onSubmit(): Promise<void> {
		return showAlert('Feature not implemented yet');
	}

	async function onCodeScan(): Promise<void> {
		return showAlert('Feature not implemented yet');
	}
</script>

<Layout title={$t('routes.organization.page.join.title')} showBackButton>
	<Card title={$t('routes.orgnization.page.join.form.title')}>
		<form use:customForm={form}>
			<InputItem
				name="code"
				label={$t('routes.organization.page.join.form.code')}
				helperText="Get it from a collective admin."
				icon={keyOutline}
				inputIcon={qrCodeOutline}
				inputIconClick={onCodeScan}
			/>
			<div class="text-center">
				<Button
					classProp="mt-3"
					expand="block"
					type="submit"
					label={$t('routes.organization.page.join.form.submit')}
					icon={saveOutline}
				/>
			</div>
		</form>
	</Card>
</Layout>
