import { Resend } from 'resend';

import { formatCurrency } from '$lib/utils';

import { getEnv } from '../../../env';
import { logger } from '../logger';

const env = getEnv();

// Initialize Resend email client
const resend = new Resend(env.RESEND_API_KEY);

export type WeeklySummaryCategory = {
	categoryName: string;
	budgetAmount: number;
	spentAmount: number;
	overByAmount?: number;
	remainingAmount?: number;
};

type WeeklySummaryEmailPayload = {
	to: string;
	name: string;
	monthLabel: string;
	overBudgetCategories: WeeklySummaryCategory[];
	nearLimitCategories: WeeklySummaryCategory[];
};

function renderWeeklyRows(
	rows: WeeklySummaryCategory[],
	type: 'over-budget' | 'near-limit'
): string {
	if (rows.length === 0) {
		return type === 'over-budget'
			? '<p style="margin: 0; color: #4b5563;">No categories are over budget this month 🎉</p>'
			: '<p style="margin: 0; color: #4b5563;">No categories are within 10% of their budget limit right now.</p>';
	}

	return `
		<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
			<thead>
				<tr>
					<th style="text-align: left; padding: 10px 8px; border-bottom: 1px solid #e5e7eb;">Category</th>
					<th style="text-align: right; padding: 10px 8px; border-bottom: 1px solid #e5e7eb;">Budget</th>
					<th style="text-align: right; padding: 10px 8px; border-bottom: 1px solid #e5e7eb;">Spent</th>
					<th style="text-align: right; padding: 10px 8px; border-bottom: 1px solid #e5e7eb;">${type === 'over-budget' ? 'Over By' : 'Left To Spend'}</th>
				</tr>
			</thead>
			<tbody>
				${rows
					.map(
						(row) => `
							<tr>
								<td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6;">${row.categoryName}</td>
								<td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #f3f4f6;">${formatCurrency(row.budgetAmount)}</td>
								<td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #f3f4f6;">${formatCurrency(row.spentAmount)}</td>
								<td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: ${type === 'over-budget' ? '#dc2626' : '#065f46'};">${formatCurrency(type === 'over-budget' ? (row.overByAmount ?? 0) : (row.remainingAmount ?? 0))}</td>
							</tr>
						`
					)
					.join('')}
			</tbody>
		</table>
	`;
}

export async function sendWeeklySummaryEmail(payload: WeeklySummaryEmailPayload) {
	logger.debug('📧 Sending weekly summary email to:', { to: payload.to });

	try {
		await resend.emails.send({
			from: env.RESEND_FROM_ADDRESS,
			to: payload.to,
			subject: `[Sheppakai Budget] Weekly Budget Summary - ${payload.monthLabel}`,
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Weekly Budget Summary</title>
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 720px; margin: 0 auto; padding: 20px; background: #ffffff;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 24px;">Weekly Budget Summary</h1>
						<p style="color: #e5e7eb; margin: 8px 0 0; font-size: 14px;">${payload.monthLabel} (month-to-date)</p>
					</div>
					<div style="background: #f9fafb; padding: 24px; border-radius: 0 0 10px 10px;">
						<p style="font-size: 16px; margin: 0 0 18px;">Hi ${payload.name},</p>
						<p style="font-size: 15px; margin: 0 0 24px; color: #374151;">Here’s your shared budget summary for this month so far.</p>

						<section style="margin-bottom: 28px; background: #ffffff; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px;">
							<h2 style="margin: 0 0 12px; color: #b91c1c; font-size: 18px;">Over Budget</h2>
							${renderWeeklyRows(payload.overBudgetCategories, 'over-budget')}
						</section>

						<section style="margin-bottom: 10px; background: #ffffff; border: 1px solid #d1fae5; border-radius: 8px; padding: 16px;">
							<h2 style="margin: 0 0 12px; color: #065f46; font-size: 18px;">Within 10% Of Budget Limit</h2>
							${renderWeeklyRows(payload.nearLimitCategories, 'near-limit')}
						</section>
					</div>
					<div style="text-align: center; margin-top: 16px; color: #9ca3af; font-size: 12px;">
						<p style="margin: 0;">Sheppakai Budget</p>
					</div>
				</body>
				</html>
			`
		});
	} catch (error) {
		logger.error('❌ Failed to send weekly summary email:', error);
		throw error;
	}
}

export async function sendVerificationEmail(to: string, name: string, verificationUrl: string) {
	logger.debug('📧 Sending Verification Email to:', { to });

	try {
		await resend.emails.send({
			from: env.RESEND_FROM_ADDRESS,
			to,
			subject: '[Sheppakai Budget] Verify your email address',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Verify your email</title>
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Sheppakai Budget</h1>
					</div>
					<div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
						<p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
						<p style="font-size: 16px; margin-bottom: 20px;">
							Thanks for signing up! Please verify your email address to get started with Sheppakai Budget.
						</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${verificationUrl}" 
							   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
								Verify Email Address
							</a>
						</div>
						<p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
							If you didn't create an account, you can safely ignore this email.
						</p>
						<p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
							This link will expire in 10 minutes.
						</p>
					</div>
					<div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
						<p>Sheppakai Budget - Your Personal Finance Companion</p>
					</div>
				</body>
				</html>
			`
		});
	} catch (error) {
		logger.error('❌ Failed to send verification email:', error);
		return error;
	}
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
	logger.debug('📧 Sending Password Reset Email to:', { to });

	try {
		await resend.emails.send({
			from: env.RESEND_FROM_ADDRESS,
			to,
			subject: '[Sheppakai Budget] Reset your password',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Reset your password</title>
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
					</div>
					<div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
						<p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
						<p style="font-size: 16px; margin-bottom: 20px;">
							We received a request to reset your password. Click the button below to create a new password.
						</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${resetUrl}" 
							   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
								Reset Password
							</a>
						</div>
						<p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
							If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
						</p>
						<p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
							This link will expire in 10 minutes for security reasons.
						</p>
					</div>
					<div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
						<p>Sheppakai Budget - Your Personal Finance Companion</p>
					</div>
				</body>
				</html>
			`
		});
	} catch (error) {
		logger.error('❌ Failed to send password reset email:', error);
		return error;
	}
}

export async function sendNewUserEmail(to: string, name: string, email: string) {
	logger.debug('📧 Sending new user email to:', { to });

	// Append gsheppard.yang@gmail.com to the to address for monitoring
	to = `${to}, ${env.RESEND_NEW_USER_ADDRESS}`;

	try {
		await resend.emails.send({
			from: env.RESEND_FROM_ADDRESS,
			to,
			subject: '[Sheppakai Budget] New User was registered!',
			html: `Hi ${name || email}!<br><br>Welcome to Sheppakai Budget! We're excited to have you on board.<br><br>Thank you,<br>Sheppakai Budget Team`
		});
	} catch (error) {
		logger.error('❌ Failed to send email', error);
		return error;
	}
}
