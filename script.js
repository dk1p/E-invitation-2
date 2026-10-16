'use strict';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
            window.scrollTo(0, 0);
            window.addEventListener('pageshow', () => {
                if (!document.querySelector('.entry.open')) window.scrollTo(0, 0);
            });

            // Decorative sparkles: lightweight, decorative only.
            (function(){
              const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              if(reduce)return;
              document.querySelectorAll(".entry-sparkles,.hero-sparkles").forEach(layer=>{
                for(let i=0;i<24;i++){
                  const s=document.createElement("i");s.className="glimmer";
                  s.style.left=(5+Math.random()*90)+"%";
                  s.style.top=(5+Math.random()*90)+"%";
                  s.style.animationDelay=(Math.random()*6)+"s";
                  s.style.animationDuration=(3+Math.random()*4)+"s";
                  layer.appendChild(s);
                }
              });
            })();

            const entry = document.getElementById('entry')
              , openBtn = document.getElementById('openBtn')
              , main = document.getElementById('main')
              , musicBtn = document.getElementById('musicBtn')
              , bgm = document.getElementById('bgm');
            let opened = false
              , playing = false;
            // First interaction anywhere unlocks and starts invitation media.
            // This works with the current background audio and any <video> added later.
            let mediaUnlocked = false;
            async function startInvitationMedia() {
                if (mediaUnlocked) return;
                mediaUnlocked = true;
                const media = document.querySelectorAll('audio, video');
                media.forEach(item => {
                    const promise = item.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(() => {});
                    }
                });
                if (bgm && !bgm.paused) {
                    playing = true;
                    musicBtn.textContent = '♫';
                }
            }
            document.addEventListener('pointerdown', startInvitationMedia, { once: true, passive: true });
            document.addEventListener('touchstart', startInvitationMedia, { once: true, passive: true });
            document.addEventListener('keydown', startInvitationMedia, { once: true });

            function openInvitation() {
                if (opened) return;
                opened = true;
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                entry.classList.add('open');
                document.body.classList.remove('locked');
                bgm.play().then(() => {
                    playing = true;
                    musicBtn.textContent = '♫';
                }).catch(() => {});
                setTimeout(() => {
                    main.classList.add('visible');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }, 450);
                setTimeout(() => entry.remove(), 2100);
            }

            // Open the invitation when the guest taps/clicks anywhere on the door screen.
            entry.addEventListener('click', openInvitation);
            musicBtn.addEventListener('click', async () => {
                if (bgm.paused) {
                    try {
                        await bgm.play();
                        playing = true;
                        musicBtn.textContent = '♫'
                    } catch (e) {}
                } else {
                    bgm.pause();
                    playing = false;
                    musicBtn.textContent = '♪'
                }
            }
            );

            function showerPetals() {
                const layer = document.getElementById('petals');
                for (let i = 0; i < 48; i++) {
                    const p = document.createElement('div');
                    p.className = 'petal';
                    p.style.left = (Math.random() * 100) + 'vw';
                    p.style.animationDuration = (2.5 + Math.random() * 2) + 's';
                    p.style.animationDelay = (Math.random() * .65) + 's';
                    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
                    p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
                    layer.appendChild(p);
                    setTimeout( () => p.remove(), 5200)
                }
            }

            // Countdown to marriage ceremony in India time.
            const target = new Date('2026-11-15T07:45:00+05:30').getTime();
            function updateCountdown() {
                const diff = Math.max(0, target - Date.now());
                const d = Math.floor(diff / 86400000)
                  , h = Math.floor(diff % 86400000 / 3600000)
                  , m = Math.floor(diff % 3600000 / 60000)
                  , s = Math.floor(diff % 60000 / 1000);
                document.getElementById('days').textContent = String(d).padStart(3, '0');
                document.getElementById('hours').textContent = String(h).padStart(2, '0');
                document.getElementById('mins').textContent = String(m).padStart(2, '0');
                document.getElementById('secs').textContent = String(s).padStart(2, '0')
            }
            updateCountdown();
            setInterval(updateCountdown, 1000);

            // Smooth reveal as each invitation section enters the viewport.
            const revealObserver = new IntersectionObserver( (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        revealObserver.unobserve(entry.target);
                    }
                }
                )
            }
            ,{
                threshold: .12,
                rootMargin: '0px 0px -8% 0px'
            });
            document.querySelectorAll('.reveal-section').forEach(el => revealObserver.observe(el));



            // Interactive blessings: chip suggestions, stickers and a letter-style success screen.
            const wishForm = document.getElementById('wishForm');
            const wishName = document.getElementById('wishName');
            const wishMessage = document.getElementById('wishMessage');
            const wishCount = document.getElementById('wishCount');
            const wishStatus = document.getElementById('wishStatus');
            const wishWall = document.getElementById('wishWall');
            const wishSuccess = document.getElementById('wishSuccess');
            const wishSticker = document.getElementById('wishSticker');
            const escapeWish = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
            // A fresh guestbook on each visit; no previously saved browser wishes.
            // FormSubmit handles email delivery, not shared public wish storage.
            let savedWishes = [];
            function drawWishes() {
                document.getElementById('wishesTotal').textContent = savedWishes.length + (savedWishes.length === 1 ? ' WISH ON THIS DEVICE' : ' WISHES ON THIS DEVICE');
                wishWall.innerHTML = savedWishes.slice(-6).reverse().map(w => `<article class="wish-bubble"><div class="wish-bubble-heart">${escapeWish(w.sticker || '♥')}</div><p>“${escapeWish(w.message)}”</p><strong>— ${escapeWish(w.name)}</strong></article>`).join('');
            }
            drawWishes();
            const updateCount=()=>{wishCount.textContent=`${wishMessage.value.length} / 300`;};
            wishMessage.addEventListener('input', updateCount);
            document.querySelectorAll('[data-blessing]').forEach(button => button.addEventListener('click', () => {
                const phrase=button.dataset.blessing;
                const current=wishMessage.value.trim();
                wishMessage.value=(current ? current+' ' : '')+phrase;
                wishMessage.value=wishMessage.value.slice(0,300);
                updateCount();wishMessage.focus();
                button.classList.remove('chip-pop');void button.offsetWidth;button.classList.add('chip-pop');
            }));
            document.querySelectorAll('[data-sticker]').forEach(button => button.addEventListener('click', () => {
                document.querySelectorAll('[data-sticker]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
                button.classList.add('selected');button.setAttribute('aria-pressed','true');wishSticker.value=button.dataset.sticker;
            }));
            document.getElementById('writeAnother').addEventListener('click', () => {
                wishSuccess.hidden=true;wishForm.hidden=false;wishForm.reset();wishSticker.value='🌸';
                document.querySelectorAll('[data-sticker]').forEach(b=>{const selected=b.dataset.sticker==='🌸';b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
                updateCount();wishStatus.textContent='';wishName.focus();
            });
            document.getElementById('seeWish').addEventListener('click', () => document.getElementById('wishWall').scrollIntoView({behavior:'smooth',block:'center'}));
            wishForm.addEventListener('submit', async e => {
                e.preventDefault();
                const name=wishName.value.trim(),message=wishMessage.value.trim();
                if(!name || !message) return;
                const submitBtn=wishForm.querySelector('.wish-submit');
                submitBtn.disabled=true;submitBtn.querySelector('span').textContent='SENDING…';
                wishStatus.textContent='Sending your blessing…';
                try {
                    const response=await fetch('https://formsubmit.co/ajax/dineshkumarpdk33@gmail.com',{
                        method:'POST',
                        headers:{'Content-Type':'application/json','Accept':'application/json'},
                        body:JSON.stringify({
                            name,relation:document.getElementById('wishRelation').value||'Not specified',
                            message,sticker:wishSticker.value,
                            _subject:'New Wedding Wish for Ramesh Kumar & Tamil Selvi',
                            _template:'table',_honey:wishForm.elements['_honey'].value
                        })
                    });
                    if(!response.ok) throw new Error('Network error');
                    const result=await response.json();
                    if(result.success === false || result.success === 'false') throw new Error('Submission rejected');
                    savedWishes.push({name,message,sticker:wishSticker.value});
                    savedWishes=savedWishes.slice(-20);
                    drawWishes();
                    document.getElementById('thankYouName').textContent='Thank you, '+name+'!';
                    wishForm.hidden=true;wishSuccess.hidden=false;
                    wishSuccess.classList.remove('success-enter');void wishSuccess.offsetWidth;wishSuccess.classList.add('success-enter');
                    showerPetals();
                } catch(error) {
                    wishStatus.textContent='Could not send your wish. Please try again.';
                } finally {
                    submitBtn.disabled=false;submitBtn.querySelector('span').textContent='SEND WISHES';
                }
            });
            // Native share sheet on supported devices; clipboard fallback on others.
            document.getElementById('shareLocation').addEventListener('click',async () => {
                const url='https://maps.app.goo.gl/NVXcCCZq2K7c6fYa9?g_st=aw';
                const feedback=document.getElementById('venueFeedback');
                try {
                    if(navigator.share) {
                        await navigator.share({title:'Ramesh & Tamil Selvi Wedding Venue',text:'Join us at Kurinjii Mahal, Tiruppur on 15 November 2026!',url});
                        feedback.textContent='Location shared ♥';
                    } else if(navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(url);
                        feedback.textContent='Location link copied!';
                    } else {
                        const a=document.createElement('textarea');a.value=url;document.body.appendChild(a);a.select();
                        const ok=document.execCommand('copy');a.remove();
                        feedback.textContent=ok?'Location link copied!':'Open the location link to share it.';
                    }
                } catch(error) { if(error.name!=='AbortError') feedback.textContent='Please use View Location to share the link.'; }
            });

            // Photo gallery + accessible full-screen preview (lightbox).
            const galleryPhotos = Array.from(document.querySelectorAll('.gallery-tile'));
            const galleryLightbox = document.getElementById('galleryLightbox');
            if (galleryPhotos.length && galleryLightbox) {
                const galleryImage = document.getElementById('galleryImage');
                const galleryStage = galleryLightbox.querySelector('.gallery-stage');
                const galleryCaption = document.getElementById('galleryCaption');
                const galleryCount = document.getElementById('galleryCount');
                const galleryThumbs = document.getElementById('galleryThumbs');
                const galleryClose = document.getElementById('galleryClose');
                const mainEl = document.getElementById('main');
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const total = galleryPhotos.length;
                let galleryIndex = 0;
                let galleryTrigger = null;
                let closeTimer = null;
                const isOpen = () => galleryLightbox.classList.contains('is-open');

                // Thumbnail strip
                const galleryThumbButtons = galleryPhotos.map((tile, i) => {
                    const src = tile.querySelector('img');
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'gallery-thumb';
                    btn.setAttribute('aria-label', `Show photo ${i + 1}: ${src.alt}`);
                    const t = document.createElement('img');
                    t.src = src.getAttribute('src');
                    t.alt = '';
                    t.draggable = false;
                    btn.appendChild(t);
                    btn.addEventListener('click', () => { if (i !== galleryIndex) showGalleryPhoto(i, i > galleryIndex ? 1 : -1); });
                    galleryThumbs.appendChild(btn);
                    return btn;
                });

                function showGalleryPhoto(index, dir = 0) {
                    galleryIndex = (index + total) % total;
                    const source = galleryPhotos[galleryIndex].querySelector('img');
                    const url = source.currentSrc || source.src;

                    galleryStage.classList.add('is-loading');
                    galleryStage.classList.remove('is-error');
                    galleryImage.classList.remove('anim-next', 'anim-prev');

                    const done = () => {
                        galleryStage.classList.remove('is-loading');
                        if (dir && !reduceMotion) {
                            void galleryImage.offsetWidth; // restart animation
                            galleryImage.classList.add(dir > 0 ? 'anim-next' : 'anim-prev');
                        }
                    };
                    const fail = () => {
                        galleryStage.classList.remove('is-loading');
                        galleryStage.classList.add('is-error');
                    };
                    galleryImage.alt = source.alt;
                    if (galleryImage.src === url && galleryImage.complete && galleryImage.naturalWidth) {
                        done();
                    } else {
                        galleryImage.onload = done;
                        galleryImage.onerror = fail;
                        galleryImage.src = url;
                    }

                    galleryCaption.textContent = source.alt;
                    galleryCount.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

                    galleryThumbButtons.forEach((b, i) => {
                        b.classList.toggle('is-active', i === galleryIndex);
                        if (i === galleryIndex) {
                            b.setAttribute('aria-current', 'true');
                            galleryThumbs.scrollTo({
                                left: b.offsetLeft - (galleryThumbs.clientWidth - b.offsetWidth) / 2,
                                behavior: reduceMotion || !isOpen() ? 'auto' : 'smooth'
                            });
                        } else {
                            b.removeAttribute('aria-current');
                        }
                    });

                    // Preload neighbours so next/prev feels instant
                    [galleryIndex - 1, galleryIndex + 1].forEach(i => {
                        const n = galleryPhotos[(i + total) % total].querySelector('img');
                        const pre = new Image();
                        pre.src = n.currentSrc || n.src;
                    });
                }

                function openGallery(index, trigger) {
                    clearTimeout(closeTimer);
                    galleryTrigger = trigger;
                    galleryLightbox.hidden = false;
                    document.documentElement.classList.add('gallery-open');
                    document.body.classList.add('gallery-open');
                    if (mainEl) mainEl.inert = true;
                    showGalleryPhoto(index);
                    void galleryLightbox.offsetWidth; // flush so the fade-in transition runs
                    galleryLightbox.classList.add('is-open');
                    galleryClose.focus({ preventScroll: true });
                }

                function closeGallery() {
                    if (!isOpen()) return;
                    galleryLightbox.classList.remove('is-open');
                    document.documentElement.classList.remove('gallery-open');
                    document.body.classList.remove('gallery-open');
                    if (mainEl) mainEl.inert = false;
                    if (galleryTrigger) galleryTrigger.focus({ preventScroll: true });
                    closeTimer = setTimeout(() => { galleryLightbox.hidden = true; }, reduceMotion ? 0 : 280);
                }

                galleryPhotos.forEach((tile, index) => tile.addEventListener('click', () => openGallery(index, tile)));
                galleryClose.addEventListener('click', closeGallery);
                document.getElementById('galleryPrev').addEventListener('click', () => showGalleryPhoto(galleryIndex - 1, -1));
                document.getElementById('galleryNext').addEventListener('click', () => showGalleryPhoto(galleryIndex + 1, 1));

                // Click on the dark backdrop (anywhere that isn't a control or the photo) closes the preview
                galleryLightbox.addEventListener('click', e => {
                    if (!e.target.closest('button, img, figcaption, .gallery-count, .gallery-thumbs')) closeGallery();
                });

                document.addEventListener('keydown', e => {
                    if (!isOpen()) return;
                    if (e.key === 'Escape') closeGallery();
                    else if (e.key === 'ArrowRight') showGalleryPhoto(galleryIndex + 1, 1);
                    else if (e.key === 'ArrowLeft') showGalleryPhoto(galleryIndex - 1, -1);
                    else if (e.key === 'Home') { e.preventDefault(); showGalleryPhoto(0, -1); }
                    else if (e.key === 'End') { e.preventDefault(); showGalleryPhoto(total - 1, 1); }
                    else if (e.key === 'Tab') {
                        const buttons = [...galleryLightbox.querySelectorAll('button')];
                        const first = buttons[0], last = buttons[buttons.length - 1];
                        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
                    }
                });

                // Touch: swipe left/right to change photo, swipe down to close
                let touchStart = null;
                galleryLightbox.addEventListener('touchstart', e => {
                    if (e.target.closest('.gallery-thumbs') || e.touches.length > 1) { touchStart = null; return; }
                    touchStart = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
                }, { passive: true });
                galleryLightbox.addEventListener('touchend', e => {
                    if (!touchStart) return;
                    const dx = e.changedTouches[0].clientX - touchStart.x;
                    const dy = e.changedTouches[0].clientY - touchStart.y;
                    touchStart = null;
                    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) showGalleryPhoto(galleryIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
                    else if (dy > 90 && Math.abs(dx) < 60) closeGallery();
                }, { passive: true });
            }

            // ----- floating hearts in the guest wishes section -----
            const fh = document.querySelector('#floatHearts');
            if (fh && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                for (let i = 0; i < 14; i++) {
                    const h = document.createElement('i');
                    h.textContent = i % 3 ? '❤' : '✦';
                    h.style.cssText = `left:${Math.random()*100}%;font-size:${10+Math.random()*16}px;animation-duration:${9+Math.random()*8}s;animation-delay:${-Math.random()*12}s;--sx:${Math.random()*80-40}px`;
                    fh.appendChild(h);
                }
            }

            // Floating hearts and stars in the countdown section.
            const countdownHearts = document.getElementById('countdownHearts');
            if (countdownHearts && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                for (let i = 0; i < 24; i++) {
                    const spark = document.createElement('i');
                    spark.textContent = i % 3 === 0 ? '✦' : '♥';
                    spark.style.cssText = `left:${Math.random()*100}%;font-size:${10+Math.random()*18}px;animation-duration:${9+Math.random()*10}s;animation-delay:${-Math.random()*19}s;--drift-x:${Math.random()*130-65}px`;
                    countdownHearts.appendChild(spark);
                }
            }
            // Scroll-to-top control.
            const scrollTopBtn = document.getElementById('scrollTopBtn');
            const syncScrollTop = () => scrollTopBtn.classList.toggle('is-visible', window.scrollY > 450);
            window.addEventListener('scroll', syncScrollTop, {passive:true});
            syncScrollTop();
            scrollTopBtn.addEventListener('click', () => window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
