/**
 * 공통 네비게이션 및 인터랙션 스크립트
 */
(function () {
    'use strict';

    function initNavigation() {
        // 모바일 메뉴 토글
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', function () {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // 현재 활성화된 링크 하이라이트
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('header a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (currentPath === href || (href !== '/' && currentPath.endsWith(href)))) {
                link.classList.add('text-primary');
                link.classList.remove('text-gray-700');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();
