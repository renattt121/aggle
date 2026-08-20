/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from "@playwright/test";

const HTML_BASE = `file://${process.cwd()}/extension/src`;

test.describe("Aggle Options Page", () => {
  test("renders settings title", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('h1').first()).toHaveText("Appearance");
  });

  test("renders appearance tab", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#tab-appearance")).toBeVisible();
  });

  test("renders AI tab", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="ai"]').click();
    await expect(page.locator("#tab-ai")).toBeVisible();
  });

  test("renders privacy tab", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="privacy"]').click();
    await expect(page.locator("#tab-privacy")).toBeVisible();
  });

  test("renders performance tab", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="performance"]').click();
    await expect(page.locator("#tab-performance")).toBeVisible();
  });

  test("renders shortcuts tab", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="shortcuts"]').click();
    await expect(page.locator("#tab-shortcuts")).toBeVisible();
  });

  test("has search engine selector", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[name="search-engine"]')).toHaveCount(3);
    await expect(page.locator('[value="duckduckgo"]')).toBeVisible();
    await expect(page.locator('[value="google"]')).toBeVisible();
    await expect(page.locator('[value="bing"]')).toBeVisible();
  });

  test("switching tabs changes active section", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="ai"]').click();
    await expect(page.locator("#tab-ai")).toHaveClass(/active/);
    await expect(page.locator("#tab-appearance")).not.toHaveClass(/active/);
  });

  test("provider select exists", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="ai"]').click();
    await expect(page.locator("#provider-select")).toBeVisible();
  });

  test("blocker toggle exists", async ({ page }) => {
    await page.goto(`${HTML_BASE}/options/options.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('[data-tab="privacy"]').click();
    await expect(page.locator("#blocker-enabled")).toBeVisible();
  });
});
