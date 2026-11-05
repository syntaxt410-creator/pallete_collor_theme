// Koleksi seluruh warna lengkap (total 65 warna terkalibrasi)
const rawColors = [
  // Batch 1 (Awal)
  "#FF5CAB", "#00F0FF", "#BC6CFF", "#FFB86B", "#0B0F2B",

  // Batch 2 (Telah diseleksi: #39FF14 ganda diganti #5B0015)
  "#000000", "#7F3AED", "#C6FF34", "#FC2B30", "#DA0090", 
  "#12002E", "#3B0855", "#852467", "#FD8083", "#EE227D", 
  "#498099", "#30C0B7", "#FF0080", "#00FFFF", "#FF00FF", 
  "#8000FF", "#39FF14", "#0080FF", "#5B0015", "#0080FF",

  // Batch 3 (Warna baru tambahan)
  "#FF206E", "#222222", "#FBFF12", "#41EAD4", "#FF0022", 
  "#121212", "#FFD000", "#FFFFFF", "#FB5607", "#8338EC", 
  "#212529", "#E9ECEF", "#FFCC00", "#FF018F", "#2D0C62", 
  "#11012E", "#030712", "#A60E35", "#FEA24F", "#10BBC3", 
  "#068187", "#051A2D", "#FFE3B3", "#F88F22", "#FBB931", 
  "#EA6113", "#26C0B4", "#9A8472", "#C8B39A", "#E0D1B8", 
  "#EFE3CE", "#F6F0E6", "#FAF7F2", "#C6B39A", "#BD3A3C", 
  "#3B1319", "#7B694E", "#2B0B0F", "#F5EFC6", "#4D0E12", 
  "#231815"
];

// Parser HEX ke Komponen R, G, B
function parseHex(hex) {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Generator Skema Dinamis berdasarkan Karakteristik HEX
function generateColorScheme(rawHex) {
  const hex = rawHex.startsWith("#") ? rawHex.toUpperCase() : `#${rawHex.toUpperCase()}`;
  const { r, g, b } = parseHex(hex);
  
  const isBlack = (r < 25 && g < 25 && b < 25);
  const isWhite = (r > 235 && g > 235 && b > 235);

  let lightR = isBlack ? 180 : Math.min(255, Math.round(r * 1.35 + 40));
  let lightG = isBlack ? 180 : Math.min(255, Math.round(g * 1.35 + 40));
  let lightB = isBlack ? 180 : Math.min(255, Math.round(b * 1.35 + 40));
  
  let darkR = isWhite ? 180 : Math.max(0, Math.round(r * 0.55));
  let darkG = isWhite ? 180 : Math.max(0, Math.round(g * 0.55));
  let darkB = isWhite ? 180 : Math.max(0, Math.round(b * 0.55));

  const bgR = isBlack ? 18 : Math.round(r * 0.16 + 10);
  const bgG = isBlack ? 14 : Math.round(g * 0.14 + 7);
  const bgB = isBlack ? 12 : Math.round(b * 0.14 + 5);

  return {
    hex: hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    
    // Swatch rectangle gradient
    swatchGradient: isBlack 
      ? `linear-gradient(135deg, #444444 0%, ${hex} 60%, #050505 100%)`
      : isWhite
      ? `linear-gradient(135deg, #ffffff 0%, #ececec 50%, #bfbfbf 100%)`
      : `linear-gradient(135deg, rgb(${lightR}, ${lightG}, ${lightB}) 0%, ${hex} 50%, rgb(${darkR}, ${darkG}, ${darkB}) 100%)`,
    swatchGlow: `0 4px 14px rgba(${isBlack ? 80 : r}, ${isBlack ? 80 : g}, ${isBlack ? 80 : b}, 0.45)`,
    
    // Background mengalir berbasis kopi + tint
    cardBg: `linear-gradient(135deg, rgb(${bgR + 8}, ${bgG + 4}, ${bgB + 6}) 0%, #120c09 45%, rgb(${bgR + 12}, ${bgG + 8}, ${bgB + 10}) 70%, #0c0806 100%)`,
    carveBg: `#070504`,
    
    // Emboss & Glow
    embossLight: `rgba(${isBlack ? 220 : lightR}, ${isBlack ? 220 : lightG}, ${isBlack ? 220 : lightB}, 0.18)`,
    tintGlow: `rgba(${isBlack ? 100 : r}, ${isBlack ? 100 : g}, ${isBlack ? 100 : b}, 0.18)`,
    carveLight: `rgba(${isBlack ? 200 : lightR}, ${isBlack ? 200 : lightG}, ${isBlack ? 200 : lightB}, 0.08)`,
    btnBg: `rgb(${Math.max(16, bgR)}, ${Math.max(11, bgG)}, ${Math.max(9, bgB)})`,
    
    // Conic line rotasi border
    rotateBorder: `conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgb(${lightR}, ${lightG}, ${lightB}) 285deg, ${hex} 360deg)`,
    
    // Typography Gradient
    textGradient: isWhite
      ? `linear-gradient(120deg, #ffffff 0%, #dadada 50%, #a8a8a8 100%)`
      : `linear-gradient(120deg, #ffffff 0%, rgb(${lightR}, ${lightG}, ${lightB}) 40%, ${hex} 100%)`,
    textGlow: `rgba(${isBlack ? 160 : r}, ${isBlack ? 160 : g}, ${isBlack ? 160 : b}, 0.55)`
  };
}

const paletteGrid = document.getElementById("paletteGrid");
const toast = document.getElementById("toast");
const toastDot = document.getElementById("toastDot");
const toastMsg = document.getElementById("toastMsg");
let toastTimer;

// DocumentFragment untuk efisiensi render DOM
const fragment = document.createDocumentFragment();

rawColors.forEach((rawColor) => {
  const item = generateColorScheme(rawColor);
  
  const card = document.createElement("div");
  card.className = "emboss-card";
  card.setAttribute("title", `Klik untuk menyalin kode ${item.hex}`);

  card.style.setProperty("--card-bg", item.cardBg);
  card.style.setProperty("--rotate-border", item.rotateBorder);
  card.style.setProperty("--carve-bg", item.carveBg);
  card.style.setProperty("--card-emboss-light", item.embossLight);
  card.style.setProperty("--card-tint-glow", item.tintGlow);
  card.style.setProperty("--carve-inset-light", item.carveLight);
  card.style.setProperty("--btn-bg", item.btnBg);
  card.style.setProperty("--text-gradient", item.textGradient);
  card.style.setProperty("--text-glow", item.textGlow);

  card.innerHTML = `
    <div class="card-inner">
      <div class="inner-carve">
        <div class="color-rectangle" style="background: ${item.swatchGradient}; box-shadow: ${item.swatchGlow};"></div>
      </div>
      <div class="color-info">
        <span class="color-hex">${item.hex}</span>
        <span class="color-rgb">${item.rgb}</span>
        <button class="copy-btn" type="button">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Salin
        </button>
      </div>
    </div>
  `;

  card.addEventListener("click", () => copyToClipboard(item.hex));
  fragment.appendChild(card);
});

paletteGrid.appendChild(fragment);

// Clipboard handler
function copyToClipboard(hex) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hex).then(() => showToast(hex));
  } else {
    const input = document.createElement("input");
    input.value = hex;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showToast(hex);
  }
}

function showToast(hex) {
  clearTimeout(toastTimer);
  toastDot.style.backgroundColor = hex;
  toastDot.style.boxShadow = `0 0 8px ${hex}`;
  toastMsg.textContent = `${hex} tersalin ke clipboard!`;
  
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}