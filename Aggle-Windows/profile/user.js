// ============================================================================
// Aggle Browser — Windows User Preferences (user.js)
// Place in: %APPDATA%\Aggle\Profiles\default\user.js
// ============================================================================

// 1. Enable user Chrome CSS customizations (Crucial for Liquid Glass)
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
user_pref("svg.context-properties.content.enabled", true);
user_pref("layout.css.backdrop-filter.enabled", true);

// 2. Hardware Acceleration & Glass Performance
user_pref("gfx.webrender.all", true);
user_pref("media.hardware-video-decoding.enabled", true);
user_pref("dom.ipc.processCount", 8);
user_pref("browser.cache.disk.capacity", 512000);
user_pref("browser.cache.disk.enable", true);

// 3. Extensions & Add-ons Permissions
// Allows local Aggle extension to load without unsigned blocking
user_pref("xpinstall.signatures.required", false);
user_pref("extensions.autoDisableScopes", 0);
user_pref("extensions.enabledScopes", 15);

// 4. UI Customizations & Layout
user_pref("toolkit.cosmeticAnimations.enabled", true);
user_pref("browser.tabs.animate", true);
user_pref("browser.tabs.groups.enabled", true);
user_pref("browser.tabs.insertAfterCurrent", true);
user_pref("browser.tabs.insertRelatedAfterCurrent", true);
user_pref("ui.prefersReducedMotion", 0);
user_pref("browser.tabs.height", 36);
user_pref("browser.chrome.site_icons", true);
user_pref("browser.newtabpage.enabled", true);
user_pref("browser.startup.page", 1);

// Force Bookmarks Toolbar to always be visible (Aggle Liquid Glass compact bookmarks bar)
user_pref("browser.toolbars.bookmarks.visibility", "always");

// Dark Theme base so chrome icons and default ink colors are light
user_pref("extensions.activeThemeID", "firefox-compact-dark@mozilla.org");

// 5. Privacy & Security
user_pref("privacy.trackingprotection.enabled", true);
user_pref("privacy.trackingprotection.pbmode.enabled", true);
user_pref("privacy.resistFingerprinting", false);
user_pref("privacy.sanitize.sanitizeOnShutdown", false);
user_pref("network.trr.mode", 2);
user_pref("network.trr.uri", "https://mozilla.cloudflare-dns.com/dns-query");

// 6. Quit Warning
user_pref("browser.showQuitWarning", true);
user_pref("browser.warnOnQuit", true);

// 7. Telemetry Opt-out
user_pref("browser.ping-centre.telemetry", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.server", "");
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
