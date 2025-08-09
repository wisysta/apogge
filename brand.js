// 스크롤 기반 애니메이션 구현
document.addEventListener("DOMContentLoaded", function () {
    // 애니메이션 요소들 설정
    const animateElements = [
        // 브랜드 히어로 개별 요소들
        { selector: ".brand-gold-symbol", delay: 0, type: "symbol" },
        { selector: ".brand-hero-description", delay: 300, type: "text" },
        {
            selector: ".brand-hero-description-second",
            delay: 600,
            type: "text",
        },
        { selector: ".brand-hero-description-third", delay: 900, type: "text" },
        { selector: ".brand-about-title", delay: 1200, type: "text" },

        // 섹션 콘텐츠들
        { selector: ".demeter-content", delay: 100, type: "content" },
        { selector: ".cerezia-content", delay: 100, type: "content" },
        { selector: ".contact-info-content", delay: 100, type: "content" },
        { selector: ".brand-logo-content", delay: 100, type: "content" },
    ];

    // Our History timeline 요소들 (순차적 애니메이션용)
    const timelineItems = document.querySelectorAll(".timeline-item");

    // CSS 클래스 추가
    addAnimationStyles();

    // Intersection Observer 설정
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    // 일반 섹션들을 위한 Observer
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const element = entry.target;

                // 타임라인 아이템들은 별도 처리되므로 제외
                if (element.classList.contains("timeline-item")) {
                    sectionObserver.unobserve(element);
                    return;
                }

                const delay = element.dataset.delay || 0;
                const animationType =
                    element.dataset.animationType || "default";

                setTimeout(() => {
                    if (animationType === "symbol") {
                        element.classList.add("animate-symbol-rotate");
                    } else {
                        element.classList.add("animate-fade-in");
                    }
                }, delay);

                sectionObserver.unobserve(element);
            }
        });
    }, observerOptions);

    // Timeline 요소들을 위한 특별한 Observer
    const timelineObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const historySection = entry.target;
                    // 이미 애니메이션이 실행되었는지 확인
                    if (!historySection.dataset.timelineAnimated) {
                        historySection.dataset.timelineAnimated = "true";
                        animateTimelineItems();
                    }
                    timelineObserver.unobserve(historySection);
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -100px 0px",
        }
    );

    // 애니메이션 요소들 관찰 시작
    animateElements.forEach(({ selector, delay, type }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.dataset.delay = delay;
            element.dataset.animationType = type;
            element.classList.add("fade-element");
            sectionObserver.observe(element);
        }
    });

    // History 섹션 관찰
    const historySection = document.querySelector(".history-section");
    if (historySection) {
        timelineObserver.observe(historySection);
    }

    // Timeline 아이템들 순차 애니메이션
    function animateTimelineItems() {
        timelineItems.forEach((item, index) => {
            // 이미 애니메이션이 적용된 아이템은 건너뛰기
            if (item.dataset.timelineItemAnimated) {
                return;
            }

            item.dataset.timelineItemAnimated = "true";
            setTimeout(() => {
                item.classList.add("animate-timeline-fade-in");
            }, index * 600); // 600ms 간격으로 순차 등장 (속도 조절)
        });
    }

    // 동적 CSS 스타일 추가
    function addAnimationStyles() {
        const style = document.createElement("style");
        style.textContent = `
            /* 기본 페이드 애니메이션 */
            .fade-element {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .fade-element.animate-fade-in {
                opacity: 1;
                transform: translateY(0);
            }

            /* 심볼 회전 애니메이션 */
            .fade-element.animate-symbol-rotate {
                opacity: 1;
                transform: translateY(0);
                animation: symbolSpinAndStop 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                animation-fill-mode: both;
            }

            @keyframes symbolSpinAndStop {
                0% {
                    opacity: 0;
                    transform: rotate(-360deg) scale(0.3);
                }
                34% {
                    opacity: 1;
                    transform: rotate(0deg) scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: rotate(0deg) scale(1);
                }
            }



            /* 연락처 아이템들 개별 애니메이션 */
            .contact-item {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .contact-info-content.animate-fade-in .contact-item {
                opacity: 1;
                transform: translateY(0);
            }

            .contact-info-content.animate-fade-in .contact-item:nth-child(1) {
                transition-delay: 0.1s;
            }

            .contact-info-content.animate-fade-in .contact-item:nth-child(2) {
                transition-delay: 0.2s;
            }

            .contact-info-content.animate-fade-in .contact-item:nth-child(3) {
                transition-delay: 0.3s;
            }

            /* 브랜드 로고 콘텐츠 애니메이션 */
            .brand-logo-content {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .brand-logo-content.animate-fade-in {
                opacity: 1;
                transform: translateY(0);
            }

            /* 호버 효과 향상 */
            .animate-fade-in .timeline-item:hover {
                transform: translateX(10px);
                transition: transform 0.3s ease;
            }

            .contact-info-content.animate-fade-in .contact-item:hover {
                transform: translateY(-5px);
                transition: transform 0.3s ease;
            }

            .brand-logo-content.animate-fade-in:hover {
                transform: translateY(-5px);
                transition: transform 0.3s ease;
            }

            /* 미디어 쿼리 - 모바일에서는 애니메이션 간소화 */
            @media (max-width: 768px) {
                .fade-element,
                .timeline-fade-element {
                    transition-duration: 0.4s;
                }
                
                .brand-hero-content.fade-element {
                    transition-duration: 0.6s;
                }
            }

            /* 접근성: 애니메이션 비활성화 사용자 */
            @media (prefers-reduced-motion: reduce) {
                .fade-element,
                .timeline-fade-element,
                .contact-item {
                    transition: none;
                    transform: none;
                    opacity: 1;
                }
                
                .timeline-symbol {
                    animation: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 스크롤 진행률 표시 (선택사항)
    function updateScrollProgress() {
        const scrolled = window.pageYOffset;
        const maxHeight =
            document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (scrolled / maxHeight) * 100;

        // 커스텀 스크롤 인디케이터가 있다면 업데이트
        const scrollIndicator = document.querySelector(".scroll-progress");
        if (scrollIndicator) {
            scrollIndicator.style.width = scrollProgress + "%";
        }
    }

    // 스크롤 이벤트 리스너 (throttle 적용)
    let scrollTimeout;
    window.addEventListener("scroll", () => {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(updateScrollProgress);
    });

    // 페이지 로드 시 초기 애니메이션 (히어로 섹션이 보이면 즉시 시작)
    setTimeout(() => {
        const heroSymbol = document.querySelector(".brand-gold-symbol");
        if (heroSymbol && isElementInViewport(heroSymbol)) {
            // 히어로 요소들을 즉시 시작
            animateElements.forEach(({ selector, delay, type }) => {
                if (selector.includes("brand-")) {
                    const element = document.querySelector(selector);
                    if (element) {
                        setTimeout(() => {
                            if (type === "symbol") {
                                element.classList.add("animate-symbol-rotate");
                            } else {
                                element.classList.add("animate-fade-in");
                            }
                        }, delay);
                    }
                }
            });
        }
    }, 100);

    // 뷰포트 확인 헬퍼 함수
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
                (window.innerWidth || document.documentElement.clientWidth)
        );
    }
});
