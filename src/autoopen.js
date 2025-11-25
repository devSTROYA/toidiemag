// ==UserScript==
// @name         Auto Open Items
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Auto klik kanan dan "Use" item.
// @author       Aoimaru
// @match        *://*.pockieninja.online/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const items = [
    {
      id: 'scroll',
      label: 'S-Scroll',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/tasks/master/38.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/tasks/master/38.png',
      ],
      withAccept: true,
    },
    {
      id: 'ascroll',
      label: 'A-Scroll',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/tasks/master/37.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/tasks/master/37.png',
      ],
      withAccept: true,
    },
    {
      id: 'stonebag',
      label: 'Stone Bag',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/226.png',
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/88.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/226.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/88.png',
      ],
      withAccept: false,
    },
    {
      id: 'sealbreaker',
      label: 'Seal Breaker',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/treasure.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/treasure.png',
      ],
      withAccept: false,
    },
    {
      id: 'bigsoul',
      label: 'Big Soul',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/15.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/15.png',
      ],
      withAccept: false,
    },
    {
      id: 'specialJar',
      label: 'Special Jar',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/293.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/293.png',
      ],
      withAccept: false,
    },
    {
      id: 'gemJar',
      label: 'Gem Jar',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/294.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/294.png',
      ],
      withAccept: false,
    },
    {
      id: 'midbeans',
      label: 'Midsized Beans',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/crops/14.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/crops/14.png',
      ],
      withAccept: false,
    },
    {
      id: 'greencard',
      label: 'Green Card',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/cards/small/1.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/cards/small/1.png',
      ],
      withAccept: false,
    },
    {
      id: 'bluecard',
      label: 'Blue Card',
      src: [
        'https://pockie-ninja-sg.sgp1.cdn.digitaloceanspaces.com/assets/public/icons/items/cards/small/2.png',
        'https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/cards/small/2.png',
      ],
      withAccept: false,
    },
  ];

  const intervalIds = {};
  const state = {};

  function createAutoOpenUI() {
    const defaultTop = '780px';
    const defaultLeft = 'auto';
    const topValue = localStorage.getItem('autoOpen_uiTop') || defaultTop;
    const leftValue = localStorage.getItem('autoOpen_uiLeft') || defaultLeft;

    // ✅ Create the element dynamically
    const div = document.createElement('div');
    div.id = 'autoOpenUI';
    div.style.position = 'fixed';
    div.style.top = topValue;
    div.style.left = leftValue;
    if (div.style.left === 'auto') div.style.right = '20px';
    div.style.background = 'rgba(0, 0, 0, 0.5)';
    div.style.padding = '12px';
    div.style.zIndex = 9999;
    div.style.borderRadius = '8px';
    div.style.fontFamily = 'sans-serif';
    div.style.width = '160px';
    div.style.userSelect = 'none';

    // ✅ Add a draggable header
    const header = document.createElement('div');
    header.textContent = 'Auto Open';
    header.style.color = '#ffffff';
    header.style.textAlign = 'center';
    header.style.fontWeight = 'bold';
    header.style.cursor = 'move';
    header.style.marginBottom = '10px';

    div.innerHTML = `
      <select id="itemSelect2" style="width: 100%; padding: 5px; margin-bottom: 10px; border-radius: 5px;">
        <option value="" disabled selected>--Choose item first--</option>
          ${items
            .map(
              (item) => `
              <option value="${item.id}">${item.label}</option>
          `
            )
            .join('')}
      </select>
      <button id="toggleBtn2" class="auto-btn">Start</button>
          <style>
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
            .auto-btn:hover {
                background-color: #0a4ed6;
            }
            .auto-btn.active {
                background-color: #e64553;
            }
          </style>
      `;

    div.prepend(header);
    document.body.appendChild(div);

    makeDraggable(div, header);

    const toggleBtn = document.getElementById('toggleBtn2');
    const select = document.getElementById('itemSelect2');

    toggleBtn.addEventListener('click', () => {
      const selectedId = select.value;
      const selectedItem = items.find((i) => i.id === selectedId);

      if (!selectedItem) {
        showSnackbar('Please choose item first.');
        return;
      }

      if (!state[selectedId]) {
        state[selectedId] = true;
        toggleBtn.textContent = 'Stop';
        toggleBtn.classList.add('active');

        intervalIds[selectedId] = startAuto(selectedItem.src, selectedItem.label, selectedItem.withAccept, () => {
          state[selectedId] = false;
          toggleBtn.textContent = 'Start';
          toggleBtn.classList.remove('active');
        });
      } else {
        state[selectedId] = false;
        clearInterval(intervalIds[selectedId]);
        toggleBtn.textContent = 'Start';
        toggleBtn.classList.remove('active');
      }
    });

    setTimeout(() => {
      const options = document.querySelectorAll('#itemSelect2 option');
      options.forEach((option) => {
        const item = items.find((i) => i.id === option.value);
        if (item) {
          const icon = Array.isArray(item.src) ? item.src[0] : item.src;
          option.style.backgroundImage = `url(${icon})`;
        }
      });
    }, 100);
  }

  function makeDraggable(element, handle) {
    let offsetX,
      offsetY,
      isDragging = false;

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
      // simpan posisi terakhir
      localStorage.setItem('autoOpen_uiTop', element.style.top);
      localStorage.setItem('autoOpen_uiLeft', element.style.left);
    }
  }

  function showSnackbar(message, background = 'rgba(230, 69, 83, 0.85)', duration = 3000) {
    // remove existing snackbar if any
    const existing = document.getElementById('autoOpenSnackbar');
    if (existing) existing.remove();

    const snackbar = document.createElement('div');
    snackbar.id = 'autoOpenSnackbar';
    snackbar.textContent = message;

    // read UI position (or fallback)
    const uiTop = parseFloat(localStorage.getItem('autoOpen_uiTop')) || 780;
    const uiLeft = parseFloat(localStorage.getItem('autoOpen_uiLeft')) || 20;

    // fixed dimensions of your floating UI
    const uiWidth = 160; // adjust this to match your UI width
    const snackbarWidth = 180; // adjust as needed for visual centering

    // position snackbar centered above the UI
    const snackbarLeft = uiLeft + uiWidth / 2 - snackbarWidth / 2;
    const snackbarTop = uiTop - 40; // show slightly above the UI

    Object.assign(snackbar.style, {
      position: 'fixed',
      top: `${snackbarTop}px`,
      left: `${snackbarLeft}px`,
      background,
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      fontFamily: 'sans-serif',
      zIndex: 99999,
      minWidth: `${snackbarWidth}px`,
      textAlign: 'center',
      opacity: '0',
      transform: 'translateY(-10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    });

    document.body.appendChild(snackbar);

    // fade in
    requestAnimationFrame(() => {
      snackbar.style.opacity = '1';
      snackbar.style.transform = 'translateY(0)';
    });

    // fade out
    setTimeout(() => {
      snackbar.style.opacity = '0';
      snackbar.style.transform = 'translateY(-10px)';
      setTimeout(() => snackbar.remove(), 400);
    }, duration);
  }

  function isMatchingSrc(imgSrc, targetSrc) {
    if (Array.isArray(targetSrc)) {
      return targetSrc.some((src) => imgSrc.includes(src));
    }
    return imgSrc.includes(targetSrc);
  }

  function startAuto(src, label, withAccept, onStop) {
    const interval = setInterval(() => {
      const items = document.querySelectorAll('.item-container .item');
      let found = false;

      for (let item of items) {
        const img = item.querySelector('img.img__image');
        if (img && isMatchingSrc(img.src, src)) {
          found = true;
          console.log(`${label} ditemukan → klik kanan`);
          const rightClick = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            view: item.ownerDocument.defaultView || window,
            button: 2,
          });
          item.dispatchEvent(rightClick);

          setTimeout(() => {
            const useBtn = [...document.querySelectorAll('.context-menu__item')].find(
              (el) => el.textContent.trim() === 'Use'
            );
            if (useBtn) {
              console.log(`Klik Use pada ${label}`);
              useBtn.click();

              if (withAccept) {
                setTimeout(() => {
                  const acceptBtn = [...document.querySelectorAll('button')].find(
                    (el) => el.textContent.trim() === 'Accept'
                  );
                  if (acceptBtn) {
                    console.log('Klik Accept');
                    acceptBtn.click();
                  }
                }, 500);
              }
            }
          }, 500);
          break;
        }
      }

      if (!found) {
        clearInterval(interval);
        console.log(`${label} tidak ditemukan. Auto ${label} dihentikan.`);
        onStop();
      }
    }, 500);

    return interval;
  }

  createAutoOpenUI();
})();
