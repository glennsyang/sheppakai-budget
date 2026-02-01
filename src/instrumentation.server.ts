import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://fc093590cdb84cd23c74c0af71692560@o4510809399492608.ingest.us.sentry.io/4510809402638336',

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
