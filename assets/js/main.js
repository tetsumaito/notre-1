/**
 * メインJavaScriptファイル - 修正版
 * 後から読み込まれるヘッダーやモーダルにも対応
 */

document.addEventListener('DOMContentLoaded', function () {
    // インクルード機能の実行
    initHeader();
    initFooter();
    initModalsInclude();
    initCompanySectionInclude();

    // 機能の初期化
    initNavigationAndModals(); // まとめて管理
    initAnimations();
    initSlideAnimation();
    initOtherFeatures();
    initCustomCarousel();
});

/**
 * ナビゲーションとモーダルの統合制御
 * ボタンが後から読み込まれても動くように document に対してイベントを設定
 */
function initNavigationAndModals() {
    const modalsContainer = document.querySelector('.modals') || document.getElementById('modals-placeholder');

    // ヘルパー: モーダルを閉じる
    function closeModal() {
        const target = document.querySelector('.modals');
        if (!target) return;

        const canvas = target.querySelector('.studio-canvas');
        const base = target.querySelector('.design-canvas__modal__base');

        if (canvas) canvas.style.opacity = '0';
        if (base) base.style.opacity = '0';

        setTimeout(() => {
            target.classList.remove('active');
            target.style.display = 'none';
            document.body.style.overflow = '';
        }, 400);
    }

    // ヘルパー: モーダルを開く
    function openModal() {
        const target = document.querySelector('.modals');
        if (!target) {
            console.error('モーダルコンテナが見つかりません。modals.htmlが読み込まれているか確認してください。');
            return;
        }

        target.style.display = 'block';
        target.classList.add('active');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            const canvas = target.querySelector('.studio-canvas');
            const base = target.querySelector('.design-canvas__modal__base');
            if (canvas) {
                canvas.style.opacity = '1';
                canvas.style.transform = 'none';
            }
            if (base) base.style.opacity = '1';
        });
    }

    // --- イベント委譲によるクリック判定 ---
    document.addEventListener('click', function (e) {
        // 1. メニューボタン（ハンバーガーボタン）をクリックした時
        if (e.target.closest('button[aria-label="menu"]')) {
            e.preventDefault();
            openModal();
        }

        // 2. 閉じるボタン (.component-78ba) をクリックした時
        if (e.target.closest('.component-78ba')) {
            e.preventDefault();
            closeModal();
        }

        // 3. モーダルの背景をクリックした時
        if (e.target.classList.contains('design-canvas__modal__base')) {
            closeModal();
        }

        // 4. メニュー内のリンクをクリックした時（ページ遷移時にメニューを閉じる）
        if (e.target.closest('.modals .link')) {
            setTimeout(closeModal, 300);
        }
    });

    // ESCキーで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
}

/**
 * 以下の include 関数群は変更なし（パス解決ロジック維持）
 */
function initHeader() {
    const p = document.getElementById('header-placeholder');
    if (p) {
        // 先頭に / をつけることで、常にドメインのトップからパスを指定
        const path = '/assets/includes/header.html';

        fetch(path)
            .then(r => {
                if (!r.ok) throw new Error('Network response was not ok');
                return r.text();
            })
            .then(h => { p.outerHTML = h; })
            .catch(e => console.error('Header load error:', e));
    }
}

function initFooter() {
    const p = document.getElementById('footer-placeholder');
    if (p) {
        const path = window.location.pathname.split('/').filter(x => x && !x.includes('.html')).length > 0 ? '../assets/includes/footer.html' : 'assets/includes/footer.html';
        fetch(path).then(r => r.text()).then(h => { p.outerHTML = h; }).catch(e => console.error(e));
    }
}

function initModalsInclude() {
    const p = document.getElementById('modals-placeholder');
    if (p) {
        const path = window.location.pathname.split('/').filter(x => x && !x.includes('.html')).length > 0 ? '../assets/includes/modals.html' : 'assets/includes/modals.html';
        fetch(path).then(r => r.text()).then(h => { p.outerHTML = h; }).catch(e => console.error(e));
    }
}

function initCompanySectionInclude() {
    const p = document.getElementById('company-section-placeholder');
    if (p) {
        const path = window.location.pathname.split('/').filter(x => x && !x.includes('.html')).length > 0 ? '../assets/includes/company-section.html' : 'assets/includes/company-section.html';
        fetch(path).then(r => r.text()).then(h => { p.outerHTML = h; }).catch(e => console.error(e));
    }
}

// 以下、アニメーション、スライド、カルーセルなどの機能は既存のものを維持
function initAnimations() {
    const targets = document.querySelectorAll('.appear');
    const obs = new IntersectionObserver((es) => {
        es.forEach(en => {
            if (en.isIntersecting) {
                en.target.style.opacity = '1';
                en.target.style.transform = 'none';
                en.target.classList.add('animated');
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.1 });
    targets.forEach(t => obs.observe(t));
}

function initSlideAnimation() {
    const containers = document.querySelectorAll('._animatingNext._playing.sd-4a0cfcfb');
    containers.forEach((c) => {
        const ss = Array.from(c.querySelectorAll('.sd-a1f64829'));
        if (ss.length <= 1) return;
        let cur = 0;
        const dur = 16000;
        ss.forEach(s => { s.style.transform = 'translateX(-100%)'; s.style.transition = `transform ${dur}ms linear`; });
        function go() {
            const cS = ss[cur];
            const nI = (cur + 1) % ss.length;
            const nS = ss[nI];
            cS.style.transform = 'translateX(100%)';
            nS.style.transform = 'translateX(0)';
            setTimeout(() => {
                cS.style.transition = 'none';
                cS.style.transform = 'translateX(-100%)';
                setTimeout(() => { cS.style.transition = `transform ${dur}ms linear`; }, 50);
                cur = nI;
                go();
            }, dur);
        }
        ss[0].style.transform = 'translateX(0)';
        setTimeout(go, 1000);
    });
}

function initOtherFeatures() {
    document.querySelectorAll('a[href^="#"]').forEach(l => {
        l.addEventListener('click', function (e) {
            const h = this.getAttribute('href');
            if (h !== '#' && h.length > 1) {
                const t = document.querySelector(h);
                if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
            }
        });
    });
}

function initCustomCarousel() {
    const c = document.querySelector('.sd-a6f9235f');
    const pB = document.querySelector('.sd-b4d12e09');
    const nB = document.querySelector('.sd-3e7e358a');
    if (!c) return;
    const ss = Array.from(c.querySelectorAll('a.link')).filter(s => !s.closest('.sd-cd6c9947'));
    if (ss.length === 0 || !pB || !nB) return;
    let cur = 0;
    function up() {
        const m = cur * (ss[0].offsetWidth + 20);
        ss.forEach(s => { s.style.transition = 'transform 0.5s ease'; s.style.transform = `translateX(-${m}px)`; });
    }
    nB.addEventListener('click', (e) => { e.preventDefault(); cur = (cur < ss.length - 1) ? cur + 1 : 0; up(); });
    pB.addEventListener('click', (e) => { e.preventDefault(); cur = (cur > 0) ? cur - 1 : ss.length - 1; up(); });
}