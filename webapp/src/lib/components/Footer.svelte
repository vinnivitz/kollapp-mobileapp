<script lang="ts">
	// @ts-expect-error types are not available
	import FaAndroid from 'svelte-icons/fa/FaAndroid.svelte';
	// @ts-expect-error types are not available
	import FaApple from 'svelte-icons/fa/FaApple.svelte';
	// @ts-expect-error types are not available
	import FaCloudDownloadAlt from 'svelte-icons/fa/FaCloudDownloadAlt.svelte';
</script>

<div class="flex items-center justify-center gap-2 px-2 md:gap-6 md:px-6">
	<a href="https://play.google.com/store/apps/details?id=org.kollapp.app">
		<div class="btn-pill">
			<div class="h-5 w-5">
				<FaApple></FaApple>
			</div>
			<div>App Store</div>
		</div>
	</a>
	<a href="https://apps.apple.com/app/id123456789">
		<div class="btn-pill">
			<div class="h-5 w-5">
				<FaAndroid></FaAndroid>
			</div>
			<div>Play Store</div>
		</div>
	</a>
	<a href="https://apk.kollapp.org">
		<div class="btn-pill">
			<div class="h-5 w-5 pt-[2px]">
				<FaCloudDownloadAlt></FaCloudDownloadAlt>
			</div>
			<div>Download APK</div>
		</div>
	</a>
</div>
