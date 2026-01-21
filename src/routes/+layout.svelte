<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';

	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster position="bottom-right" richColors />
<Tooltip.Provider>
	{@render children()}
</Tooltip.Provider>
