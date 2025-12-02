// ==UserScript==
// @name         Auto Refine++
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Auto Refine, Enhance, Inscribe, and Recast
// @author       Aoimaru
// @match        *://*.pockieninja.online/
// @grant        none
// ==/UserScript==

const COLORS = {
  SUCCESS: 'rgba(64, 160, 43, 0.9)',
  FAILED: 'rgba(230, 69, 83, 0.9)',
};
const items = [
  { id: 'refine', label: 'Refine' },
  { id: 'enhance', label: 'Enhance' },
  { id: 'inscribe', label: 'Inscribe' },
  { id: 'recast', label: 'Recast' },
];
const DEFAULT_TOP = 780;
const DEFAULT_LEFT = 'auto';
const SNACKBAR_ID = 'SNACKBAR';
const AUTO_SNACKBAR = 'autoRefineSnackbar';
const FLOATING_UI_ID = 'FLOATING_REFINE_UI';
const AUTO_UI_TOP = 'autoRefine_uiTop';
const AUTO_UI_LEFT = 'autoRefine_uiLeft';
const uiTop = parseFloat(localStorage.getItem(AUTO_UI_TOP)) || DEFAULT_TOP;
const uiLeft = parseFloat(localStorage.getItem(AUTO_UI_LEFT)) || DEFAULT_LEFT;

class Refine {
  static isRunningRefine = false;

  static reroll() {
    return new Promise((resolve) => {
      let attemptButton = document.querySelector('#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(2) > button:nth-child(2)');

      if (attemptButton) {
        attemptButton.click();
        console.log('🔄 Clicked Attempt button!');

        setTimeout(() => {
          let acceptButton = document.querySelector('#game-container > div:nth-child(6) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)');
          if (acceptButton) {
            acceptButton.click();
            console.log('✅ Clicked Accept button!');
            resolve(true);
          } else resolve(false);
        }, 500);
      } else resolve(false);
    });
  }

  static async startAutomation() {
    showSnackbar('Refine automation started...', COLORS.SUCCESS);

    const requiredStatsInput = prompt('Please enter required stats separated by comma (ex: Stamina, Dodge):', 'Stamina, Dodge');
    const optionalStatsInput = prompt('Please enter optional stats separated by comma (ex: Agility, Hit):', 'Agility, Hit');

    if (!requiredStatsInput || !optionalStatsInput) {
      showSnackbar('Please enter required and optional stats.', COLORS.FAILED);
      document.getElementById('toggleButtonEnhance')?.click();
      return;
    }

    const requiredStats = requiredStatsInput.split(',');
    const optionalStats = optionalStatsInput.split(',');

    this.isRunningRefine = true;

    // const requiredStats = ['Stamina', 'Dodge'];
    // const optionalStats = ['Max Health', 'Max Health %', 'Const', 'Hit', 'Defense'];

    while (this.isRunningRefine) {
      let stats = await checkStats();
      let hasRequired = requiredStats.every((stat) => stats.includes(stat));
      let hasOptional = optionalStats.some((stat) => stats.includes(stat));

      if (hasRequired) {
        if (hasOptional) {
          console.log('✅ Stats ditemukan (Wajib & Opsional):', stats);
          showSnackbar('🎉 Stats found! Stop auto refine.', COLORS.SUCCESS);
          this.isRunningRefine = false;
          document.getElementById('toggleButtonEnhance')?.click();
          break;
        } else {
          console.log('⚠️ Stats wajib ada, tapi tidak ada stat opsional! Reroll lagi...');
          await this.reroll();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        console.log('❌ Stats tidak cocok, reroll lagi...');
        await this.reroll();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  static stopAutomation() {
    this.isRunningRefine = false;
    showSnackbar('Refine automation stopped...', COLORS.SUCCESS);
  }
}

class Enhance {
  static isRunningEnhance = false;

  static isRateZero() {
    const preTags = document.querySelectorAll('pre');

    for (const pre of preTags) {
      const text = pre.textContent.trim();
      if (text.startsWith('Rate:')) {
        const value = text.replace('Rate:', '').trim();
        return value === '0%';
      }
    }

    return false;
  }

  static autoClickEnhance() {
    if (!this.isRunningEnhance) return;

    const boundCallback = this.autoClickEnhance.bind(this);

    const isRateZero = this.isRateZero();

    if (isRateZero) {
      document.getElementById('toggleButtonEnhance')?.click();
    }

    let attemptButton = document.querySelector('#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(1) > button:nth-child(2)');
    let acceptButton = document.querySelector('#game-container > div:nth-child(6) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)');

    if (attemptButton) attemptButton.click();

    setTimeout(() => {
      if (acceptButton) acceptButton.click();
    }, 250);

    setTimeout(boundCallback, 250);
  }

  static startAutomation() {
    this.isRunningEnhance = true;
    showSnackbar('Enhance automation started...', COLORS.SUCCESS);
    this.autoClickEnhance();
  }

  static stopAutomation() {
    this.isRunningEnhance = false;
    showSnackbar('Enhance automation stopped...', COLORS.SUCCESS);
  }
}

class Inscribe {
  static failStreak = 0;
  static maxFailStreak = 30;
  static inscribeInterval = 0;

  static setInputValue(input, value) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  static processInscribe(type, amount, currentLevel) {
    const lowRadio = document.querySelector("#game-container input[type=radio][name=bonus][value='0']");
    const highRadio = document.querySelector("#game-container input[type=radio][name=bonus][value='1']");
    const inputBox = document.querySelector('#game-container input[type=number]');

    if (!lowRadio || !highRadio || !inputBox) {
      console.log('⚠️ Element talisman not found.');
      return;
    }

    if (type === 'low') {
      lowRadio.click();
    } else {
      highRadio.click();
    }

    this.setInputValue(inputBox, amount);
    console.log(`🎯 Set ${amount} ${type === 'low' ? 'Low' : 'High'} Talisman for Level ${currentLevel}`);
  }

  static setTalismanByLevel(currentLevel) {
    switch (true) {
      // Level 0–5
      case currentLevel >= 0 && currentLevel <= 5:
        this.processInscribe('low', 1, currentLevel);
        break;

      // Level 6
      case currentLevel === 6:
        this.processInscribe('low', 3, currentLevel);
        break;

      // Level 7
      case currentLevel === 7:
        this.processInscribe('high', 3, currentLevel);
        break;

      // Level 8
      case currentLevel === 8:
        this.processInscribe('low', 1, currentLevel);
        break;

      // Level 9–10
      case [9, 10].includes(currentLevel):
        this.processInscribe('low', 3, currentLevel);
        break;

      // Level 11
      case currentLevel === 11:
        this.processInscribe('high', 3, currentLevel);
        break;

      // Level 12
      case currentLevel === 12:
        this.processInscribe('low', 1, currentLevel);
        break;

      // Level 13
      case currentLevel === 13:
        this.processInscribe('low', 3, currentLevel);
        break;

      // Level 14–15
      case [14, 15].includes(currentLevel):
        this.processInscribe('high', 3, currentLevel);
        break;
    }
  }

  static autoInscribe() {
    if (!this.isRunningInscribe) return;

    const boundCallback = this.autoInscribe.bind(this);

    const lvlElem = document.querySelector(
      '#game-container > div:nth-child(4) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > pre:nth-child(1)'
    );

    if (lvlElem) {
      const lvlText = lvlElem.innerText.trim();
      const levelMatch = lvlText.match(/Current Lvl:\s*(\d+)/);
      if (levelMatch) {
        const currentLevel = parseInt(levelMatch[1]);
        this.setTalismanByLevel(currentLevel);
      }
    }

    const inscribeButton = document.querySelector('#game-container > div:nth-child(4) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(3) > button');
    if (inscribeButton && inscribeButton.innerText.trim() === 'Attempt') {
      inscribeButton.click();
      console.log("✍️ Clicked 'Attempt' button...");

      setTimeout(() => {
        const resultElem = document.querySelector(
          '#game-container > div:nth-child(4) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > pre:nth-child(1)'
        );
        if (resultElem) {
          const resultText = resultElem.innerText.trim().toLowerCase();

          if (resultText.includes('success')) {
            console.log('✅ Inscribe Success!');
            this.failStreak = 0; // reset gagal
          } else if (resultText.includes('fail')) {
            console.warn('❌ Inscribe Failed.');
            this.failStreak++;
          } else {
            console.log(`📜 Unknown result: ${resultText}`);
          }

          if (this.failStreak >= this.maxFailStreak) {
            this.stopAutomation();
            alert('⚠️ Auto Inscribe dihentikan karena gagal berturut-turut!');
          }
        }
      }, 1000);
    } else {
      console.log("❌ 'Attempt' button not found.");
    }

    const randomDelay = 500 + Math.floor(Math.random() * 1500);
    clearInterval(this.inscribeInterval);
    this.inscribeInterval = setInterval(boundCallback, randomDelay);
  }

  static startAutomation() {
    if (this.isRunningInscribe) return;

    this.isRunningInscribe = true;
    console.log('🖋️ Auto Inscribe Started...');
    showSnackbar('Inscribe automation started...', COLORS.SUCCESS);
    this.failStreak = 0;
    this.autoInscribe();
  }

  static stopAutomation() {
    this.isRunningInscribe = false;
    showSnackbar('Inscribe automation stopped...', COLORS.SUCCESS);
    clearInterval(this.inscribeInterval);
    console.log('🛑 Stopped Auto Inscribe.');
  }
}

class Recast {
  static isRunningRecast = false;

  static autoRecast() {
    if (!this.isRunningRecast) return;

    const boundCallback = this.autoRecast.bind(this);

    const attemptButton = document.querySelector('#game-container > div:nth-child(4) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(2) > button');

    const acceptButton = document.querySelector('#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)');

    if (!attemptButton || attemptButton.disabled) {
      console.log('⛔ Recast Attempt unavailable (button disabled). Stopping loop.');
      document.getElementById('toggleButtonEnhance')?.click();
      return;
    }

    attemptButton.click();
    console.log("🔁 Clicked Recast 'Attempt'");

    setTimeout(() => {
      if (acceptButton && !acceptButton.disabled) {
        acceptButton.click();
        console.log("✔ Clicked 'Accept'");
      }

      setTimeout(boundCallback, 600);
    }, 600);
  }

  static startAutomation() {
    if (this.isRunningRecast) return;
    this.isRunningRecast = true;

    showSnackbar('Recast automation started...', COLORS.SUCCESS);
    this.autoRecast();
  }

  static stopAutomation() {
    this.isRunningRecast = false;
    showSnackbar('Recast automation stopped...', COLORS.SUCCESS);
  }
}

function reflowStack() {
  const SNACKBAR_HEIGHT_SHIFT = 40;
  const SNACKBAR_CLASS = AUTO_SNACKBAR;
  const remainingSnackbars = document.querySelectorAll(`.${SNACKBAR_CLASS}`);
  const stackSize = remainingSnackbars.length;

  remainingSnackbars.forEach((sb, index) => {
    const newOffset = -SNACKBAR_HEIGHT_SHIFT * (stackSize - 1 - index);

    sb.style.zIndex = 99999 + index;
    sb.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    sb.style.transform = `translate(-50%, ${newOffset}px)`;
  });
}

function showSnackbar(message, background, duration = 3000) {
  const SNACKBAR_CLASS = AUTO_SNACKBAR;
  const IS_FAILED = background === COLORS.FAILED;
  const MAX_SNACKBARS = 3;
  const uniqueId = `${SNACKBAR_ID}_${Date.now()}`;

  let existingSnackbars = document.querySelectorAll(`.${SNACKBAR_CLASS}`);

  if (existingSnackbars.length >= MAX_SNACKBARS) {
    existingSnackbars[0]?.remove();
    existingSnackbars = document.querySelectorAll(`.${SNACKBAR_CLASS}`);
  }

  const floatingUI = document.getElementById(FLOATING_UI_ID);

  if (!floatingUI) return console.error('Floating UI element not found.');

  const uiRect = floatingUI.getBoundingClientRect();
  const snackbarBaseTop = uiRect.top - 40;
  const snackbarCenterX = uiRect.left + uiRect.width / 2;

  const snackbar = document.createElement('div');
  snackbar.id = uniqueId;
  snackbar.className = SNACKBAR_CLASS;
  snackbar.textContent = message;

  Object.assign(snackbar.style, {
    position: 'fixed',
    top: `${snackbarBaseTop}px`,
    left: `${snackbarCenterX}px`,
    width: 'auto',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, 0)',
    background,
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    zIndex: 99999,
    textAlign: 'center',
    opacity: '0',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  });
  document.body.appendChild(snackbar);

  reflowStack();

  requestAnimationFrame(() => {
    snackbar.style.opacity = '1';

    if (IS_FAILED) {
      const ANIMATION_DURATION = '0.4s';
      snackbar.style.animation = `snackbar-shake ${ANIMATION_DURATION} ease-in-out 1`;

      setTimeout(() => {
        snackbar.style.animation = 'none';
      }, 200);
    }
  });

  setTimeout(() => {
    snackbar.style.opacity = '0';
    snackbar.style.transform = 'translate(-50%, 10px)';

    setTimeout(() => {
      const removedElement = document.getElementById(uniqueId);
      if (!removedElement) return;

      removedElement.remove();

      reflowStack();
    }, 400);
  }, duration);
}

function makeDraggable(element, handle) {
  let offsetX = false;
  let offsetY = false;
  let isDragging = false;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
  });

  function move(e) {
    if (!isDragging) return;
    const left = e.clientX - offsetX;
    const top = e.clientY - offsetY;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.right = 'auto';
  }

  function stop() {
    isDragging = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', stop);

    // saved last state
    localStorage.setItem(AUTO_UI_TOP, element.style.top);
    localStorage.setItem(AUTO_UI_LEFT, element.style.left);
  }
}

function checkStats() {
  return new Promise((resolve) => {
    let allStats = [];
    let itemContainer = document.querySelector('div.item-container div.item img.img__image');

    if (itemContainer) {
      let event = new Event('mouseover', { bubbles: true });
      itemContainer.dispatchEvent(event);
    }

    setTimeout(() => {
      let statDivs = document.querySelectorAll("div#tooltip div[style*='color: rgb(56, 142, 233);']");
      statDivs.forEach((div) => {
        let text = div.innerText.split('\n')[0];
        allStats.push(text);
      });

      console.log('📜 Item Stats:', allStats);
      resolve(allStats);
    }, 500);
  });
}

function buttonToggle() {
  let isRunning = false;
  let isRetrying = false;
  let countdownInterval = null;

  const button = document.getElementById('toggleButtonEnhance');
  const selectedItem = document.getElementById('itemSelectEnhance');

  button.addEventListener('click', () => {
    const selectedValue = selectedItem.value;
    const itemExist = items.find((i) => i.id === selectedValue);

    if (!itemExist) {
      showSnackbar('Please choose item first.', COLORS.FAILED);
      return;
    }

    if (isRunning) {
      if (countdownInterval) clearInterval(countdownInterval);
      isRetrying = false;
    }

    isRunning = !isRunning;
    button.textContent = isRunning ? `Stop` : `Start`;
    button.classList.toggle('active', isRunning);

    selectedItem.disabled = isRunning;

    switch (selectedValue) {
      case 'refine':
        isRunning ? Refine.startAutomation() : Refine.stopAutomation();
        break;
      case 'enhance':
        isRunning ? Enhance.startAutomation() : Enhance.stopAutomation();
        break;
      case 'inscribe':
        isRunning ? Inscribe.startAutomation() : Inscribe.stopAutomation();
        break;
      case 'recast':
        isRunning ? Recast.startAutomation() : Recast.stopAutomation();
        break;
    }
  });
}

function injectGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = `
      /* Keyframes for the Vibrate/Squeeze effect */
      @keyframes snackbar-shake {
        0%, 100% { transform: translate(-50%, 0); }
        10%, 30%, 50%, 70%, 90% { transform: translate(calc(-50% - 10px), 0); }
        20%, 40%, 60%, 80% { transform: translate(calc(-50% + 10px), 0); }
      }
      .auto-btn {
        width: 100%;
        padding: 6px 10px;
        border: none;
        border-radius: 5px;
        background-color: #1e66f5;
        color: white;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s ease-in-out;
      }
      .auto-btn.enabled {
        opacity: 1;
      }
      .auto-btn:hover:enabled {
        background-color: #0a4ed6;
      }
      .auto-btn.active {
        background-color: #e64553;
      }
      .auto-btn.active:hover {
        background-color: #dc1e2e;
      }
  `;
  document.head.appendChild(style);
}

function floatingUI() {
  const div = document.createElement('div');
  div.id = FLOATING_UI_ID;
  div.style.position = 'fixed';
  div.style.top = `${uiTop}px`;
  div.style.left = uiLeft === 'auto' ? uiLeft : `${uiLeft}px`;
  if (div.style.left === 'auto') {
    div.style.right = '20px';
  }
  div.style.background = 'rgba(0, 0, 0, 0.5)';
  div.style.padding = '12px';
  div.style.zIndex = 99999;
  div.style.borderRadius = '8px';
  div.style.fontFamily = 'sans-serif';
  div.style.width = '170px';
  div.style.userSelect = 'none';

  // ✅ Add a draggable header
  const header = document.createElement('div');
  header.textContent = 'Auto Enhance';
  header.style.color = '#ffffff';
  header.style.textAlign = 'center';
  header.style.fontWeight = 'bold';
  header.style.cursor = 'move';
  header.style.marginBottom = '10px';

  div.innerHTML = `
    <select id="itemSelectEnhance" style="width: 100%; padding: 5px; margin-bottom: 10px; border-radius: 5px; text-align: center; text-align-last: center;">
      <option value="" disabled selected>-- Choose item first --</option>
      ${items.map((item) => `<option value="${item.id}">${item.label}</option>`).join('')}
    </select>
    <button id="toggleButtonEnhance" class="auto-btn">Start</button>
  `;

  div.prepend(header);
  document.body.appendChild(div);

  makeDraggable(div, header);

  buttonToggle();
}

(function () {
  'use strict';

  injectGlobalStyles();
  floatingUI();
})();
