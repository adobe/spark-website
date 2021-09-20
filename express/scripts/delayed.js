/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global window webVitals document fetch */

import {
  loadScript,
  getLocale,
  createTag,
  getLanguage,
  getHelixEnv,
  sendRUMData,
} from './scripts.js';

// this saves on file size when this file gets minified...
const w = window;

function handleConsentSettings() {
  try {
    if (!w.adobePrivacy || w.adobePrivacy.hasUserProvidedCustomConsent()) {
      w.sprk_full_consent = false;
      return;
    }
    if (w.adobePrivacy.hasUserProvidedConsent()) {
      w.sprk_full_consent = true;
    } else {
      w.sprk_full_consent = false;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Couldn't determine user consent status:", e);
    w.sprk_full_consent = false;
  }
}

w.addEventListener('adobePrivacy:PrivacyConsent', handleConsentSettings);
w.addEventListener('adobePrivacy:PrivacyReject', handleConsentSettings);
w.addEventListener('adobePrivacy:PrivacyCustom', handleConsentSettings);
w.fedsConfig = w.fedsConfig || {};
w.fedsConfig.privacy = w.fedsConfig.privacy || {};
w.fedsConfig.privacy.otDomainId = '7a5eb705-95ed-4cc4-a11d-0cc5760e93db';
w.fedsConfig.privacy.footerLinkSelector = '#openCookieModal';
w.marketingtech = {
  adobe: {
    launch: {
      property: 'global',
      environment: 'production',
    },
    analytics: {
      additionalAccounts: 'adbemmarvelweb.prod',
    },
    target: true,
  },
};

async function showRegionPicker() {
  const $body = document.body;
  const locale = getLocale(window.location);
  const regionpath = locale === 'us' ? '/' : `/${locale}/`;
  const host = window.location.hostname === 'localhost' ? 'https://www.adobe.com' : '';
  const url = `${host}${regionpath}`;
  const resp = await fetch(url);
  const html = await resp.text();
  const $div = createTag('div');
  $div.innerHTML = html;
  const $regionNav = $div.querySelector('nav.language-Navigation');
  if (!$regionNav) {
    return;
  }
  const $regionPicker = createTag('div', { id: 'region-picker' });
  $body.appendChild($regionPicker);
  $regionPicker.appendChild($regionNav);
  $regionPicker.addEventListener('click', (event) => {
    if (event.target === $regionPicker || event.target === $regionNav) {
      $regionPicker.remove();
    }
  });
  $regionPicker.querySelectorAll('li a').forEach(($a) => {
    $a.addEventListener('click', (event) => {
      const pathSplits = new URL($a.href).pathname.split('/');
      const prefix = pathSplits[1] ? `/${pathSplits[1]}` : '';
      const destLocale = pathSplits[1] ? `${pathSplits[1]}` : 'us';
      const off = locale !== 'us' ? locale.length + 1 : 0;
      const gPath = window.location.pathname.substr(off);

      let domain = '';
      if (window.location.hostname.endsWith('.adobe.com')) domain = ' domain=adobe.com;';
      const cookieValue = `international=${destLocale};${domain} path=/`;
      // eslint-disable-next-line no-console
      console.log(`setting international based on language switch to: ${cookieValue}`);
      document.cookie = cookieValue;
      event.preventDefault();
      window.location.href = prefix + gPath;
    });
  });
}

const locale = getLocale(window.location);

window.fedsConfig = {
  ...window.fedsConfig,

  footer: {
    regionModal: () => {
      showRegionPicker();
    },
  },
  locale,
  content: {
    experience: 'cc-express/spark-gnav',
  },
  profile: {
    customSignIn: () => {
      const sparkLang = getLanguage(getLocale(window.location));
      const sparkPrefix = sparkLang === 'en-US' ? '' : `/${sparkLang}`;
      let sparkLoginUrl = `https://spark.adobe.com${sparkPrefix}/sp/`;
      const env = getHelixEnv();
      if (env && env.spark) {
        sparkLoginUrl = sparkLoginUrl.replace('spark.adobe.com', env.spark);
      }
      window.location.href = sparkLoginUrl;
    },
  },
};

loadScript('https://www.adobe.com/etc.clientlibs/globalnav/clientlibs/base/feds.js', () => {
  window.addEventListener('feds.events.experience.loaded', () => {
    /* attempt to switch link */
    if (window.location.pathname.includes('/create/')
      || window.location.pathname.includes('/discover/')
      || window.location.pathname.includes('/feature/')) {
      const $aNav = document.querySelector('header a.feds-navLink--primaryCta');
      const $aHero = document.querySelector('main > div:first-of-type a.button.primary');
      if ($aNav && $aHero) {
        $aNav.href = $aHero.href;
      }
    }

    const gnav = document.getElementById('feds-header');
    const placeholder = document.getElementById('header-placeholder');
    gnav.classList.add('appear');
    placeholder.classList.add('disappear');

    /* switch all links if lower envs */
    const env = getHelixEnv();
    if (env && env.spark) {
      // eslint-disable-next-line no-console
      console.log('lower env detected');
      document.querySelectorAll('a[href^="https://spark.adobe.com/"]').forEach(($a) => {
        const hrefURL = new URL($a.href);
        hrefURL.host = env.spark;
        $a.setAttribute('href', hrefURL.toString());
      });
    }
  }, 500);
}).id = 'feds-script';

loadScript('https://static.adobelogin.com/imslib/imslib.min.js');

/* Core Web Vitals */

function storeCWV(measurement) {
  const { weight, id, generation } = window.hlx.rum;
  const rum = { cwv: { }, weight, id };
  rum.cwv[measurement.name] = measurement.value;
  rum.referer = window.location.href;
  if (generation) rum.generation = generation;
  sendRUMData(rum, weight);
}

const { weight, id, random } = window.hlx.rum;
const generation = 'instrumentation-test';
window.hlx.rum.generation = generation;

if (random && (random * weight < 1)) {
  // store a page view
  sendRUMData({
    weight,
    id,
    referer: window.location.href,
    generation,
  }, weight);

  const script = document.createElement('script');
  script.src = 'https://unpkg.com/web-vitals';
  script.onload = () => {
    // When loading `web-vitals` using a classic script, all the public
    // methods can be found on the `webVitals` global namespace.
    webVitals.getCLS(storeCWV);
    webVitals.getFID(storeCWV);
    webVitals.getLCP(storeCWV);
  };
  document.head.appendChild(script);
}
