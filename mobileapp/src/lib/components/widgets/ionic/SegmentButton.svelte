<script lang="ts">
	type Properties = {
		icon: string;
		label: string;
		value: string;
		id?: string;
		indexed?: string;
	};
	let { icon, id, indexed, label, value }: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
</script>

<ion-segment-button {value} {id}>
	<ion-icon {icon}></ion-icon>
	<ion-label>{label}</ion-label>
</ion-segment-button>
