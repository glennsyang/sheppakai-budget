import { getEnv } from '../../../env';
import { logger } from '../logger';

const env = getEnv();

/**
 * Sends a notification to your phone
 * @param message The main body of the notification
 * @param title Optional title
 * @param priority 1-5 (5 is max/urgent)
 */
export async function sendAuthAlerts(message: string, title = 'App Alert', priority = 3) {
	try {
		const response = await fetch(`${env.AUTH_ALERTS_URL}`, {
			method: 'POST',
			body: message,
			headers: {
				Title: title,
				Priority: priority.toString(),
				Tags: 'rotating_light'
			}
		});

		return response.ok;
	} catch (err) {
		logger.error('Notification failed', err);
		return false;
	}
}

/**
 * Sends a notification to your phone
 * @param message The main body of the notification
 * @param title Optional title
 * @param priority 1-5 (5 is max/urgent)
 */
export async function sendBudgetAlerts(
	message: string,
	title = 'Sheppakai - Budget Alert',
	priority = 3
) {
	try {
		const response = await fetch(`${env.BUDGET_ALERTS_URL}`, {
			method: 'POST',
			body: message,
			headers: {
				Title: title,
				Priority: priority.toString(),
				Tags: 'rotating_light'
			}
		});

		return response.ok;
	} catch (err) {
		logger.error('Notification failed', err);
		return false;
	}
}
