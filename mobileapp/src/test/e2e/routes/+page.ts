import { expect, test } from '@playwright/test';

import { PageRoute } from '$lib/models/routing';

test.describe('Home Page', () => {
	test('renders user card when user is logged in', async ({ page }) => {
		await page.goto(PageRoute.HOME);

		const userCard = page.locator('text=User: john_doe');
		await expect(userCard).toBeVisible();
	});

	test('navigates to organization dashboard when organization exists', async ({ page }) => {
		// Simulate a state where both a user and an organization exist.
		// For example, ?user=john_doe&org=Acme%20Inc simulates a user and an organization named "Acme Inc".
		await page.goto('/?user=john_doe&org=Acme%20Inc');

		// Check that the organization card renders the organization name.
		const orgCard = page.locator('text=Acme Inc');
		await expect(orgCard).toBeVisible();

		// The button in the organization card calls goto(PageRoute.ORGANIZATION.ROOT).
		// Assume the translation for the button label renders as "Go to Organization".
		// Adjust the text below if necessary.
		await page.click('button:has-text("Go to Organization")');
		await expect(page).toHaveURL('/organization');
	});

	test('renders register and join organization cards when no organization exists', async ({ page }) => {
		// Simulate a logged-in user without an organization.
		await page.goto('/?user=john_doe');

		// When there is no organization, two cards are rendered.
		// We assume the titles render as "Register Organization" and "Join Organization".
		const registerCard = page.locator('text=Register Organization');
		const joinCard = page.locator('text=Join Organization');

		await expect(registerCard).toBeVisible();
		await expect(joinCard).toBeVisible();

		// Test that clicking the register button navigates to the registration route.
		// We assume the register button label is "Register".
		await page.click('button:has-text("Register")');
		await expect(page).toHaveURL('/organization/register');

		// Navigate back to test the join button.
		await page.goto('/?user=john_doe');
		// We assume the join button label is "Join".
		await page.click('button:has-text("Join")');
		await expect(page).toHaveURL('/organization/join');
	});
});
