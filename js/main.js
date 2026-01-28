// メインファイル
(function() {
    'use strict';

    // DOMContentLoaded イベント
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initScrollEffects();
        initLazyLoading();
        initAccessibility();
        initAnimations();
    });

    // ナビゲーション機能
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-menu a');

        // モバイルメニュートグル
        if (navToggle) {
            navToggle.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
                this.classList.toggle('active');
                
                // メニューが開いたときのフォーカストラップ
                if (!isExpanded) {
                    // 最初のリンクにフォーカス
                    setTimeout(() => {
                        const firstLink = navMenu.querySelector('a');
                        if (firstLink) firstLink.focus();
                    }, 100);
                }
            });
        }

        // スムーズスクロール
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // モバイルメニューを閉じる
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                    
                    // スクロール
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // URLを更新
                    history.pushState(null, null, targetId);
                }
            });
        }

        // スクロール時のヘッダー制御
        let lastScrollTop = 0;
        let scrollTimeout;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const header = document.querySelector('.header');
            
            // スクロール中のクラスを追加
            header.classList.add('scrolling');
            
            // タイムアウトでスクロール終了を検知
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                header.classList.remove('scrolling');
            }, 150);
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // 下にスクロール
                header.style.transform = 'translateY(-100%)';
            } else {
                // 上にスクロール
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // スクロール効果
    function initScrollEffects() {
        // スクロール時のアニメーション
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // 監視対象の要素
        const animateElements = document.querySelectorAll(
            '.feature-card, .voice-card, .safety-item, .concept-image, .hero-image'
        );
        
        animateElements.forEach(el => observer.observe(el));
    }

    // 遅延読み込み
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // アクセシビリティ機能
    function initAccessibility() {
        // キーボードナビゲーション
        document.addEventListener('keydown', function(e) {
            // Escapeキーでモバイルメニューを閉じる
            if (e.key === 'Escape') {
                const navMenu = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
            
            // 矢印キーでのメニュー操作
            if (e.target.closest('.nav-menu')) {
                handleMenuKeyboard(e);
            }
        });

        // メニューキーボード操作
        function handleMenuKeyboard(e) {
            const menuItems = Array.from(document.querySelectorAll('.nav-menu a'));
            const currentIndex = menuItems.indexOf(document.activeElement);
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % menuItems.length;
                    menuItems[nextIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
                    menuItems[prevIndex].focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    menuItems[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    menuItems[menuItems.length - 1].focus();
                    break;
            }
        }

        // フォーカス管理
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.classList.add('focus-visible');
            });
            
            element.addEventListener('blur', function() {
                this.classList.remove('focus-visible');
            });
        });

        // スキップリンク
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'メインコンテンツにスキップ';
        skipLink.className = 'skip-link';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // スクリーンリーダー用のライブリージョン
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);

        // ページの読み込み状態を通知
        window.addEventListener('load', function() {
            liveRegion.textContent = 'ページの読み込みが完了しました';
        });
    }

    // アニメーション初期化
    function initAnimations() {
        // フェードインアニメーション
        const fadeElements = document.querySelectorAll('.fade-in');
        
        fadeElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        // タイピングアニメーション（ヒーロータイトル）
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.textContent = '';
            heroTitle.style.opacity = '1';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            setTimeout(typeWriter, 500);
        }
    }

    // ボタンクリック効果
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn')) {
            // リップル効果
            const ripple = document.createElement('span');
            const rect = e.target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            e.target.style.position = 'relative';
            e.target.style.overflow = 'hidden';
            e.target.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });

    // パララックス効果
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });

    // フォームバリデーション（将来的に使用）
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }

    // エラーハンドリング
    window.addEventListener('error', function(e) {
        console.error('エラーが発生しました:', e.message);
        // ここにエラー報告システムを実装できます
    });

    // CSSアニメーション用のキーフレーム追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 9999;
            transition: top 0.3s;
        }
        
        .skip-link:focus {
            top: 6px;
        }
        
        .focus-visible {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
        
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--white);
            box-shadow: 0 5px 20px var(--shadow);
            padding: var(--spacing-md);
            gap: var(--spacing-md);
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    `;
    document.head.appendChild(style);

})();