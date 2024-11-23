<script lang="ts">
	import './button.pcss';

	interface Properties {
		/** Is this the principal call to action on the page? */
		primary?: boolean;
		/** What background color to use */
		backgroundColor?: string;
		/** How large should the button be? */
		size?: 'small' | 'medium' | 'large';
		/** Button contents */
		label: string;
		/** The onclick event handler */
		onClick?: () => void;
	}

	const {
		primary = false,
		backgroundColor,
		size = 'medium',
		label,
		onClick
	}: Properties = $props();
</script>

<button
	type="button"
	class={['storybook-button', `storybook-button--${size}`].join(' ')}
	class:storybook-button--primary={primary}
	class:storybook-button--secondary={!primary}
	style:background-color={backgroundColor}
	onclick={onClick}
>
	{label}
</button>
