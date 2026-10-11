const navBtn = document.getElementById('navbtn'), navEl = document.getElementById('nav');
if (navBtn) navBtn.addEventListener('click', () => { const o = navEl.classList.toggle('open'); navBtn.setAttribute('aria-expanded', o); });
