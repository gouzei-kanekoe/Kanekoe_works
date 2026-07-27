/* ──────────────────────────────────────────────────────────────
   版權駐腳年份：自動跟著時間走，不用每年逐頁手改。

   ・GitHub Pages 是靜態寄存，沒有伺服器端可以產生年份，
     所以年份取自瀏覽器時鐘，並固定用香港時區（UTC+8）換算，
     令全世界的訪客都在香港時間 1 月 1 日 00:00 一齊轉年。
   ・訪客電腦時鐘出錯時，不會顯示比 FLOOR_YEAR 更早的年份。
   ・此檔要放在 <p id="site-credit"> 之後、拆字上色之前執行。
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var FLOOR_YEAR = 2026;   /* 下限：網站現有年份，避免訪客時鐘出錯時倒退 */

  var host = document.getElementById('site-credit');
  if (!host) return;

  var year = 0;

  try {
    year = parseInt(new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Hong_Kong',
      year: 'numeric'
    }).format(new Date()), 10);
  } catch (e) {}

  if (!year || isNaN(year)) {
    /* 後備：以 UTC 手算 +8 時區 */
    var hk = new Date(Date.now() + (8 * 60 + new Date().getTimezoneOffset()) * 60000);
    year = hk.getFullYear();
  }

  if (!(year >= FLOOR_YEAR)) year = FLOOR_YEAR;

  var text = host.textContent || '';
  var next = text.replace(/(?:19|20)\d{2}/, String(year));
  if (next !== text) host.textContent = next;
})();
