<script lang="ts">
	type Properties = {
		icon: string;
		label: string;
		value: string;
		id?: string;
		searchable?: string | unknown;
	};
	let { icon, id, label, searchable, value }: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;
</script>

<ion-segment-button {value} {id}>
	<ion-icon {icon}></ion-icon>
	<ion-label>{label}</ion-label>
</ion-segment-button>
