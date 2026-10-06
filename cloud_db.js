/**
 * ============================================================================
 * KAITHANGU / OURSUPPORT.IN — UNIFIED CLIENT CLOUD & DISPATCH ENGINE
 * Works across all 7 services seamlessly with zero cost & zero lag.
 * ============================================================================
 */

const OURSUPPORT_CONFIG = {
  founderPhone: '9745226500',
  brandName: 'OurSupport.in · കൈത്താങ്ങ്',
  // Live Google Apps Script Web App URL:
  cloudApiUrl: 'https://script.google.com/macros/s/AKfycbwecAv29v2Y7y9wSIxrYL6mcovhnf4CrpD8tU5gk3eXmdZ6zlJQBZi8upHKj7Rz980avg/exec' 
};

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
  msg += `_OurSupport.in വഴി സമർപ്പിച്ചത്_`;
  
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
