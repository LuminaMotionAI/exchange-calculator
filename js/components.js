/**
 * 공통 컴포넌트 로더
 * Header와 Footer를 동적으로 로드합니다.
 */

(function () {
    'use strict';

    // 기본 경로 설정 (서브 페이지에서도 작동하도록)
    const basePath = getBasePath();

    /**
     * 현재 페이지 깊이에 따른 기본 경로 계산
     */
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return '..';
        }
        return '.';
    }

    /**
     * HTML 파일 fetch 후 삽입
     */
    async function loadComponent(elementId, componentPath) {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const response = await fetch(`${basePath}${componentPath}`);
            if (!response.ok) throw new Error(`Failed to load ${componentPath}`);

            let html = await response.text();

            // 경로 수정: /pages/ -> basePath/pages/
            html = html.replace(/href="\//g, `href="${basePath}/`);
            html = html.replace(/src="\//g, `src="${basePath}/`);

            element.innerHTML = html;

            // 스크립트 실행
            const scripts = element.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
            });

            // 현재 페이지 네비게이션 하이라이트
            highlightCurrentPage();

        } catch (error) {
            console.error(`Error loading component: ${error.message}`);
        }
    }

    /**
     * 현재 페이지 네비게이션 링크 하이라이트
     */
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('header a');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.endsWith(href.replace('..', '').replace('.', ''))) {
                link.classList.add('text-primary');
                link.classList.remove('text-gray-700');
            }
        });
    }

    /**
     * DOM 로드 후 컴포넌트 로드
     */
    document.addEventListener('DOMContentLoaded', function () {
        loadComponent('header-placeholder', '/components/header.html');
        loadComponent('footer-placeholder', '/components/footer.html');
    });
})();
