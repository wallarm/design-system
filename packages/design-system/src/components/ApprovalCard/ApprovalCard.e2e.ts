import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';
import { holdAgentsStill, waitForAgentBakes } from '../AgentAvatar/agentAvatar.e2e.helpers';

const approvalCardStory = createStoryHelper('ai-approvalcard', [
  'Pending',
  'With Requester',
  'Pending Long Text',
  'Pending With Code Snippet',
  'Allow Once Menu',
  'Approved',
  'Rejected',
] as const);

test.describe('Component: ApprovalCard', () => {
  test.describe('Visual', () => {
    test('Should render pending state correctly', async ({ page }) => {
      await approvalCardStory.goto(page, 'Pending');
      await expect(page).toHaveScreenshot();
    });

    test('Should render an agent requester correctly', async ({ page }) => {
      await holdAgentsStill(page);
      await approvalCardStory.goto(page, 'With Requester');
      await waitForAgentBakes(page.getByTestId('approval-card-requester'));
      await expect(page).toHaveScreenshot();
    });

    test('Should render long text wrapped correctly', async ({ page }) => {
      await approvalCardStory.goto(page, 'Pending Long Text');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with code snippet correctly', async ({ page }) => {
      await approvalCardStory.goto(page, 'Pending With Code Snippet');
      await expect(page).toHaveScreenshot();
    });

    test('Should render approved state correctly', async ({ page }) => {
      await approvalCardStory.goto(page, 'Approved');
      await expect(page).toHaveScreenshot();
    });

    test('Should render rejected state correctly', async ({ page }) => {
      await approvalCardStory.goto(page, 'Rejected');
      await expect(page).toHaveScreenshot();
    });

    test('Should render open Allow once menu correctly', async ({ page }) => {
      await approvalCardStory.goto(page, 'Allow Once Menu');
      await expect(page.getByTestId('approval-card-allow-once')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open Allow once menu when chevron is clicked', async ({ page }) => {
      await approvalCardStory.goto(page, 'Pending');
      const trigger = page.getByTestId('approval-card-more');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByTestId('approval-card-allow-once')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be named by its caption via group role', async ({ page }) => {
      await approvalCardStory.goto(page, 'Pending');
      await expect(page.getByRole('group', { name: 'Requires your approval' })).toBeVisible();
    });

    test('Should be announced as resolved via status role', async ({ page }) => {
      await approvalCardStory.goto(page, 'Approved');
      await expect(page.getByRole('status')).toHaveText('Approved');
    });
  });
});
