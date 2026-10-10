/**
 * ============================================================================
 * KAITHANGU / ORUSUPPORT.COM — UNIFIED CLIENT CLOUD & DISPATCH ENGINE
 * Works across all 7 services seamlessly with zero cost & zero lag.
 * ============================================================================
 */

const OURSUPPORT_CONFIG = {
  founderPhone: '9745226500',
  brandName: 'OruSupport.com · കൈത്താങ്ങ്',
  // Live Google Apps Script Web App URL:
  cloudApiUrl: 'https://script.google.com/macros/s/AKfycbwecAv29v2Y7y9wSIxrYL6mcovhnf4CrpD8tU5gk3eXmdZ6zlJQBZi8upHKj7Rz980avg/exec',
  adminPin: '974522',
  shareBanner: 'https://www.orusupport.com/share-banner.png'
};

/**
 * Universal Language Engine
 * Default is ALWAYS Malayalam ('ml'). English is ONLY used if explicitly chosen by the user.
 */
try {
  // Purge legacy storage keys that had 'en' stuck from early development
  ['kth1l', 'thuna3l', 'edu1l', 'job1l', 'hlt1l', 'lgl1l', 'sup1l', 'emg1l', 'kth_team_lang'].forEach(k => {
    localStorage.removeItem(k);
  });
} catch(e) {}

function getAppLang() {
  // STRICT REQUIREMENT:
  // Every page reload, new tab, or browser launch MUST unconditionally open in Malayalam ('ml').
  // English is purely an active-session or in-memory choice by clicking the button.
  return 'ml';
}

function setAppLang(l) {
  // Purge any stored language preference so reloads/new visits always default to Malayalam
  try {
    localStorage.removeItem('kth_user_lang_pref');
  } catch(e) {}
}

/**
 * Universal Input Validators
 */
const OurValidator = {
  isValidPhone: function(phone) {
    if (!phone) return false;
    const clean = String(phone).replace(/\D/g, '');
    return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
  },
  
  isValidName: function(name) {
    if (!name) return false;
    return name.trim().length >= 2;
  },
  
  isValidAge: function(age, min, max) {
    const a = parseInt(age, 10);
    if (isNaN(a)) return false;
    if (min !== undefined && a < min) return false;
    if (max !== undefined && a > max) return false;
    return true;
  }
};

/**
 * Robust Client Form Draft Manager (Never lose typed data on mobile tab switches or app toggling)
 */
const OurDraft = {
  save: function(key, data) {
    try {
      if (!key) return;
      localStorage.setItem('kth_draft_' + key, JSON.stringify(data));
    } catch (e) {
      console.warn('Draft save notice:', e);
    }
  },

  load: function(key) {
    try {
      if (!key) return null;
      const val = localStorage.getItem('kth_draft_' + key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  },

  clear: function(key) {
    try {
      if (!key) return;
      localStorage.removeItem('kth_draft_' + key);
    } catch (e) {}
  },

  /**
   * Automatically attaches input/change listeners to all fields in container
   */
  bindAutoSync: function(pageKey, getFv, onRestore) {
    // Save on visibility change or page hide
    const flush = () => {
      try {
        const data = typeof getFv === 'function' ? getFv() : null;
        if (data && Object.keys(data).length > 0) {
          OurDraft.save(pageKey, data);
        }
      } catch (e) {}
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);

    // Initial restore if exists
    const existing = OurDraft.load(pageKey);
    if (existing && typeof onRestore === 'function') {
      try {
        onRestore(existing);
      } catch (e) {
        console.warn('Restore draft error:', e);
      }
    }
  }
};

/**
 * Universal Official Footer for All Pages
 * Focuses on Organization (People Service Mission Kerala) & includes Copyright + Ana Cart Technology Solutions
 */
function getOurSupportFooter(lang) {
  const isMl = (lang === 'ml');
  return `
  <div class="wrap" style="text-align:center;line-height:1.75;padding:8px 0">
    <div style="font-weight:700;font-size:1.05rem;color:#fff;letter-spacing:0.5px">
      ${isMl ? 'OruSupport.com · കൈത്താങ്ങ്' : 'OruSupport.com · Kaithangu'}
    </div>
    <div style="color:#CFE3E0;font-size:0.9rem;margin:5px 0">
      ${isMl ? 'പീപ്പിൾസ് സർവീസ് മിഷൻ കേരള · ഔദ്യോഗിക ഹെൽപ്‌ലൈൻ: ' : 'People Service Mission Kerala · Official Helpline: '}
      <a href="tel:9745226500" style="color:#25D366;font-weight:700;text-decoration:none">9745226500</a>
    </div>
    <div style="color:#9DB1B2;font-size:0.83rem;max-width:760px;margin:6px auto 12px;line-height:1.5">
      ${isMl ? 'വിവാഹം, വിദ്യാഭ്യാസം, തൊഴിൽ, ആരോഗ്യം, നിയമം, കുടുംബം, അടിയന്തര സഹായം: സാധാരണക്കാർക്ക് 7 സൗജന്യ സേവനങ്ങൾ ഒരു കുടക്കീഴിൽ. നിഷ്പക്ഷവും സുരക്ഷിതവുമായ ജനസേവന സംരംഭം.' : 'Matrimony, Education, Jobs, Health, Legal, Family & Emergency: 7 free welfare services under one roof. A community-first initiative.'}
    </div>
    <div style="margin:8px 0">
      <a href="team.html" style="color:var(--gold,#F2A93B);text-decoration:none;font-weight:600;font-size:.88rem">🤝 ${isMl ? 'സംഘടനാ നേതൃത്വം & ജില്ലാ കോർഡിനേറ്റർമാർ' : 'Leadership & District Coordinators'} →</a>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;margin-top:12px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;font-size:0.82rem;color:#9DB1B2">
      <div>
        © 2026 OruSupport.com · People Service Mission Kerala. All Rights Reserved.
      </div>
      <div>
        Powered by <a href="https://www.anatechsolutions.in/" target="_blank" rel="noopener" style="color:var(--gold,#F2A93B);text-decoration:underline;font-weight:600">Anatech Technology Solutions</a>
      </div>
    </div>
  </div>`;
}

/**
 * Generates an instant WhatsApp message link to the Founder / District Coordinator
 */
function createWhatsAppDispatch(serviceTitle, refId, fields) {
  let msg = `*${OURSUPPORT_CONFIG.brandName}*\n`;
  msg += `─────────────────────────\n`;
  msg += `📋 *സേവനം:* ${serviceTitle}\n`;
  msg += `🔖 *റഫറൻസ് നമ്പർ:* ${refId}\n`;
  
  for (const key in fields) {
    if (fields[key] !== undefined && fields[key] !== null && String(fields[key]).trim() !== '') {
      msg += `▫️ *${key}:* ${fields[key]}\n`;
    }
  }
  
  msg += `─────────────────────────\n`;
  msg += `📅 *തീയതി:* ${new Date().toLocaleDateString('en-IN')}\n`;
  msg += `_OruSupport.com വഴി സമർപ്പിച്ചത്_`;
  
  const encoded = encodeURIComponent(msg);
  return `https://wa.me/91${OURSUPPORT_CONFIG.founderPhone}?text=${encoded}`;
}

/**
 * Saves record locally and pushes to Cloud Backend asynchronously
 */
function syncRecordToCloud(service, type, data) {
  // Always store in offline / sync queue
  try {
    const queueKey = 'oursupport_cloud_queue';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    queue.push({ service, type, data, timestamp: new Date().toISOString() });
    localStorage.setItem(queueKey, JSON.stringify(queue.slice(-100))); // keep last 100
  } catch (e) {
    console.warn('Local queue write notice:', e);
  }
  
  // If cloud endpoint configured, send asynchronously
  if (OURSUPPORT_CONFIG.cloudApiUrl && OURSUPPORT_CONFIG.cloudApiUrl.startsWith('http')) {
    try {
      fetch(OURSUPPORT_CONFIG.cloudApiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: service, type: type, data: data })
      }).catch(err => console.log('Cloud sync background notice:', err));
    } catch (err) {
      console.log('Background fetch:', err);
    }
  }
}
