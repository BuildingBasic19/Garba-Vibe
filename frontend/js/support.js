// Optional "support the platform" popup. Shown after a PNG download.
// It only DISPLAYS your QR. GarbaVibe does not process or verify payments.
function showSupport() {
  const c = window.GARBAVIBE_SUPPORT;
  if (!c || !c.enabled) return;
  const d = document.createElement('dialog');
  d.className = 'support';
  d.setAttribute('aria-labelledby', 'sup-title');
  const h = document.createElement('h2'); h.id = 'sup-title'; h.textContent = 'Your story is ready! 🪔';
  const p = document.createElement('p');
  p.textContent = 'GarbaVibe is free to use. If it made your festival a little brighter, you can help us keep it running with a small contribution. It is completely optional.';
  const img = document.createElement('img'); img.alt = 'Payment QR code'; img.src = c.qrImage;
  const note = document.createElement('p'); note.textContent = 'Scan with any UPI app. UPI ID: ' + c.upiId + ' (' + c.payeeName + ')';
  img.onerror = () => { img.remove(); note.textContent = 'UPI ID: ' + c.upiId + ' (' + c.payeeName + ')'; };
  const copy = document.createElement('button'); copy.className = 'btn'; copy.textContent = 'Copy UPI ID';
  copy.onclick = async () => { try { await navigator.clipboard.writeText(c.upiId); copy.textContent = 'Copied!'; } catch { copy.textContent = c.upiId; } };
  const close = document.createElement('button'); close.className = 'btn alt'; close.textContent = 'Maybe later';
  close.onclick = () => { d.close(); d.remove(); };
  const row = document.createElement('div'); row.className = 'row'; row.style.justifyContent = 'center'; row.append(copy, close);
  d.append(h, p, img, note, row);
  document.body.appendChild(d);
  d.showModal();
}
