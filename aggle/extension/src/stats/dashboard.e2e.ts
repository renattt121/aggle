/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from "@playwright/test";

const HTML_BASE = `file://${process.cwd()}/extension/src`;

test.describe("Aggle Stats Dashboard", () => {
  test("renders overview tab", async ({ page }) => {
    await page.goto(`${HTML_BASE}/stats/dashboard.html`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#tab-overview")).toHaveClass(/active/);
  });

  test("renders tabs navigation", async ({ page }) => {
    await page.goto(`${HTML_BASE}/stats/dashboard.html`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-tab="overview"]')).toBeVisible();
    await expect(page.locator('[data-tab="tabs"]')).toBeVisible();
    await expect(page.locator('[data-tab="performance"]')).toBeVisible();
  });

  test("shows stat counters", async ({ page }) => {
    await page.goto(`${HTML_BASE}/stats/dashboard.html`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#stat-total")).toBeVisible();
    await expect(page.locator("#stat-today")).toBeVisible();
    await expect(page.locator("#stat-tabs")).toBeVisible();
  });

  test("switching to tabs tab shows tab list", async ({ page }) => {
    await page.goto(`${HTML_BASE}/stats/dashboard.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="tabs"]').click();
    await expect(page.locator("#tab-tabs")).toHaveClass(/active/);
  });

  test("performance tab has profile selectors", async ({ page }) => {
    await page.goto(`${HTML_BASE}/stats/dashboard.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="performance"]').click();
    await expect(page.locator('[name="profile"][value="eco"]')).toBeVisible();
    await expect(page.locator('[name="profile"][value="balanced"]')).toBeVisible();
    await expect(page.locator('[name="profile"][value="performance"]')).toBeVisible();
  });

  test("shows Aggle Stats branding", async ({ page }) => {
    await page.goto(`${HTML_BASE}/stats/dashboard.html`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".side .brand span")).toContainText("Aggle Stats");
  });
});
