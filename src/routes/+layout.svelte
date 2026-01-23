<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';

	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster position="bottom-right" richColors />
<Tooltip.Provider>
	{@render children()}
</Tooltip.Provider>
