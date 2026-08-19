// Bundled default filter list — EasyList-compatible rules that ship with the
// extension. This covers the most common ad/tracker domains so the user gets
// protection out of the box with zero setup.

export const BUNDLED_FILTERS = `
! Aggle bundled base list — v0.1.0
! Covers the most common ad and tracker domains.
! Full EasyList-compatible lists can be added from Settings.
!
! Ads / tracking
||doubleclick.net^$third-party
||googlesyndication.com^$third-party
||googletagmanager.com^$third-party
||google-analytics.com^$third-party
||facebook.net^$third-party
||facebook.com^$third-party
||fbcdn.net^$third-party
||analytics.yahoo.com^$third-party
||scorecardresearch.com^$third-party
||mixpanel.com^$third-party
||intercom.io^$third-party
||criteo.com^$third-party
||adnxs.com^$third-party
||pubmatic.com^$third-party
||openx.net^$third-party
||amazon-adsystem.com^$third-party
||clickbank.net^$third-party
||cj.com^$third-party
||impact.com^$third-party
||shareasale.com^$third-party
||tradedoubler.com^$third-party
||quantserve.com^$third-party
||hotjar.com^$third-party
||segment.com^$third-party
||klarna.com^$third-party
||tiktok.com^$third-party
||snapchat.com^$third-party
!
! Analytics
||mixpanel.com^$third-party
||fullstory.com^$third-party
||hotjar.com^$third-party
||matomo.org^$third-party
||piwik.org^$third-party
!
! Crypto miners (coinhive etc.)
||coinhive.com^
||minero.pw^
||nohash.life^
|https://coinhive.com/
|https://minero.pw/
`;
