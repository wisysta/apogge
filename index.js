// iOS 뷰포트 높이 문제 해결을 위한 함수
function setViewportHeight() {
    // 더 안정적인 뷰포트 높이 계산
    // visualViewport가 지원되면 사용, 아니면 window.innerHeight 사용
    const height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
    const vh = height * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// 초기 설정용 변수들
let initialHeight = window.innerHeight;
let isInitialized = false;

// 페이지 로드 시 실행
function initializeViewportHeight() {
    if (!isInitialized) {
        setViewportHeight();
        initialHeight = window.innerHeight;
        isInitialized = true;
    }
}

// DOMContentLoaded 후 초기화
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeViewportHeight);
} else {
    initializeViewportHeight();
}

// 화면 방향 변경 시에만 업데이트 (실제 기기 회전)
window.addEventListener("orientationchange", () => {
    setTimeout(() => {
        setViewportHeight();
        initialHeight = window.innerHeight;
    }, 100);
});

// visualViewport API가 지원되는 경우에만 사용 (더 정확한 뷰포트 감지)
if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
        // 실제 화면 크기 변경인지 확인 (스크롤로 인한 변경 제외)
        const currentHeight = window.visualViewport.height;
        const heightDiff = Math.abs(currentHeight - initialHeight);

        // 높이 차이가 100px 이상일 때만 업데이트 (실제 화면 변경으로 간주)
        if (heightDiff > 100) {
            setViewportHeight();
            initialHeight = currentHeight;
        }
    });
}

// DOM 로드 완료 후 실행
// 로딩 완료 후 메인 페이지 초기화
function initializeMainPage() {
    // SVG 동적 로드 및 애니메이션 설정
    function loadMapSVG() {
        const mapContainer = document.getElementById("map-container");
        if (!mapContainer) return;

        // 화면 크기에 따라 다른 SVG 파일 선택 (768px 이하는 모바일)
        const isMobile = window.innerWidth <= 768;
        const svgPath = isMobile
            ? "https://ecimg.cafe24img.com/pg2069b88099925051/cerezia/images/map-mo-final.svg"
            : "https://ecimg.cafe24img.com/pg2069b88099925051/cerezia/images/map-pc.svg";

        fetch(svgPath)
            .then((response) => response.text())
            .then((svgText) => {
                // SVG 내용을 컨테이너에 삽입
                mapContainer.innerHTML = svgText;

                // SVG 로드 완료 후 애니메이션 및 이벤트 설정
                setupMapAnimations();
                setupMapHoverEvents();
            })
            .catch((error) => {
                console.error("SVG 로드 실패:", error);
            });
    }

    // 지도 애니메이션 설정
    function setupMapAnimations() {
        const svg = document.querySelector("#map-container svg");
        if (!svg) return;

        // 애니메이션 요소들 추가
        const canadaRound = svg.querySelector("#canada-round");
        const canadaCircle = svg.querySelector("#canada-circle");
        const newzealandRound = svg.querySelector("#newzealand-round");
        const newzealandCircle = svg.querySelector("#newzealand-circle");

        // 애니메이션 SVG 요소 생성 및 추가
        if (canadaRound) addPulseAnimation(canadaRound, "0s");
        if (canadaCircle) addPulseAnimation(canadaCircle, "0.5s");
        if (newzealandRound) addPulseAnimation(newzealandRound, "0s");
        if (newzealandCircle) addPulseAnimation(newzealandCircle, "0.5s");
    }

    // 펄스 애니메이션 추가 (opacity만)
    function addPulseAnimation(element, delay) {
        // Opacity 애니메이션만 추가
        const animateOpacity = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "animate"
        );
        animateOpacity.setAttribute("attributeName", "fill-opacity");
        animateOpacity.setAttribute("values", "0.1;0.6;0.1");
        animateOpacity.setAttribute("dur", "3s");
        animateOpacity.setAttribute("begin", delay);
        animateOpacity.setAttribute("repeatCount", "indefinite");
        element.appendChild(animateOpacity);
    }

    // 지도 호버 이벤트 설정
    function setupMapHoverEvents() {
        const svg = document.querySelector("#map-container svg");
        if (!svg) return;

        // 요소들 선택
        const canadaCircle = svg.querySelector("#canada-circle");
        const canadaDottedLine = svg.querySelector("#canada-dottted-line");
        const canadaText = svg.querySelector("#canada-text");

        const newzealandCircle = svg.querySelector("#newzealand-circle");
        const newzealandDottedLine = svg.querySelector(
            "#newzealand-dottted-line"
        );
        const newzealandText = svg.querySelector("#newzealand-text");

        // 각 지역별 애니메이션 상태 관리 (단순화)
        let canadaAnimation = {
            state: "idle", // 'idle', 'showing', 'shown', 'hiding'
            timers: [],
            touchActive: false,
        };

        let newzealandAnimation = {
            state: "idle",
            timers: [],
            touchActive: false,
        };

        // 초기 설정
        function initializeElements() {
            if (canadaDottedLine) {
                canadaDottedLine.style.opacity = "0";
                canadaDottedLine.style.transition = "opacity 0.5s ease";
            }
            if (canadaText) {
                canadaText.style.opacity = "0";
                canadaText.style.transform = "translateY(10px)";
                canadaText.style.transition =
                    "opacity 0.4s ease, transform 0.4s ease";
            }
            if (newzealandDottedLine) {
                newzealandDottedLine.style.opacity = "0";
                newzealandDottedLine.style.transition = "opacity 0.5s ease";
            }
            if (newzealandText) {
                newzealandText.style.opacity = "0";
                newzealandText.style.transform = "translateY(10px)";
                newzealandText.style.transition =
                    "opacity 0.4s ease, transform 0.4s ease";
            }
        }

        // 통합된 캐나다 애니메이션 함수들
        function showCanadaAnimation() {
            // 이미 표시 중이거나 표시된 상태면 종료
            if (
                canadaAnimation.state === "showing" ||
                canadaAnimation.state === "shown"
            ) {
                return;
            }

            // 기존 타이머들 정리
            clearCanadaTimers();
            canadaAnimation.state = "showing";

            // 하나의 애니메이션 시퀀스로 처리 (타이밍 그대로 유지)
            executeCanadaShow();
        }

        function hideCanadaAnimation() {
            // 터치 활성화 상태면 숨기지 않음
            if (canadaAnimation.touchActive) {
                return;
            }

            // 애니메이션이 진행 중이면 완료까지 기다림
            if (canadaAnimation.state === "showing") {
                const delayTimer = setTimeout(() => {
                    executeCanadaHide();
                }, 800); // show 애니메이션 완료까지 기다림
                canadaAnimation.timers.push(delayTimer);
                return;
            }

            // 이미 숨기는 중이면 무시
            if (canadaAnimation.state === "hiding") {
                return;
            }

            executeCanadaHide();
        }

        function executeCanadaShow() {
            // 점선 먼저 표시 (즉시)
            if (canadaDottedLine) {
                canadaDottedLine.style.opacity = "1";
            }

            // 0.3초 후 텍스트 표시
            const textTimer = setTimeout(() => {
                if (canadaText) {
                    canadaText.style.opacity = "1";
                    canadaText.style.transform = "translateY(0)";
                }

                // 텍스트 애니메이션 완료 후 상태 변경 (0.4초 후)
                const completeTimer = setTimeout(() => {
                    canadaAnimation.state = "shown";
                }, 400);
                canadaAnimation.timers.push(completeTimer);
            }, 300);
            canadaAnimation.timers.push(textTimer);
        }

        function executeCanadaHide() {
            clearCanadaTimers();
            canadaAnimation.state = "hiding";

            // 텍스트 먼저 숨김 (즉시)
            if (canadaText) {
                canadaText.style.opacity = "0";
                canadaText.style.transform = "translateY(10px)";
            }

            // 0.1초 후 점선 숨김
            const lineTimer = setTimeout(() => {
                if (canadaDottedLine) {
                    canadaDottedLine.style.opacity = "0";
                }

                // 점선 애니메이션 완료 후 상태 초기화 (0.5초 후)
                const resetTimer = setTimeout(() => {
                    canadaAnimation.state = "idle";
                }, 500);
                canadaAnimation.timers.push(resetTimer);
            }, 100);
            canadaAnimation.timers.push(lineTimer);
        }

        function clearCanadaTimers() {
            canadaAnimation.timers.forEach((timer) => clearTimeout(timer));
            canadaAnimation.timers = [];
        }

        // 통합된 뉴질랜드 애니메이션 함수들
        function showNewzealandAnimation() {
            // 이미 표시 중이거나 표시된 상태면 종료
            if (
                newzealandAnimation.state === "showing" ||
                newzealandAnimation.state === "shown"
            ) {
                return;
            }

            // 기존 타이머들 정리
            clearNewzealandTimers();
            newzealandAnimation.state = "showing";

            // 하나의 애니메이션 시퀀스로 처리 (타이밍 그대로 유지)
            executeNewzealandShow();
        }

        function hideNewzealandAnimation() {
            // 터치 활성화 상태면 숨기지 않음
            if (newzealandAnimation.touchActive) {
                return;
            }

            // 애니메이션이 진행 중이면 완료까지 기다림
            if (newzealandAnimation.state === "showing") {
                const delayTimer = setTimeout(() => {
                    executeNewzealandHide();
                }, 800); // show 애니메이션 완료까지 기다림
                newzealandAnimation.timers.push(delayTimer);
                return;
            }

            // 이미 숨기는 중이면 무시
            if (newzealandAnimation.state === "hiding") {
                return;
            }

            executeNewzealandHide();
        }

        function executeNewzealandShow() {
            // 점선 먼저 표시 (즉시)
            if (newzealandDottedLine) {
                newzealandDottedLine.style.opacity = "1";
            }

            // 0.3초 후 텍스트 표시
            const textTimer = setTimeout(() => {
                if (newzealandText) {
                    newzealandText.style.opacity = "1";
                    newzealandText.style.transform = "translateY(0)";
                }

                // 텍스트 애니메이션 완료 후 상태 변경 (0.4초 후)
                const completeTimer = setTimeout(() => {
                    newzealandAnimation.state = "shown";
                }, 400);
                newzealandAnimation.timers.push(completeTimer);
            }, 300);
            newzealandAnimation.timers.push(textTimer);
        }

        function executeNewzealandHide() {
            clearNewzealandTimers();
            newzealandAnimation.state = "hiding";

            // 텍스트 먼저 숨김 (즉시)
            if (newzealandText) {
                newzealandText.style.opacity = "0";
                newzealandText.style.transform = "translateY(10px)";
            }

            // 0.1초 후 점선 숨김
            const lineTimer = setTimeout(() => {
                if (newzealandDottedLine) {
                    newzealandDottedLine.style.opacity = "0";
                }

                // 점선 애니메이션 완료 후 상태 초기화 (0.5초 후)
                const resetTimer = setTimeout(() => {
                    newzealandAnimation.state = "idle";
                }, 500);
                newzealandAnimation.timers.push(resetTimer);
            }, 100);
            newzealandAnimation.timers.push(lineTimer);
        }

        function clearNewzealandTimers() {
            newzealandAnimation.timers.forEach((timer) => clearTimeout(timer));
            newzealandAnimation.timers = [];
        }

        // 모바일 터치 이벤트 처리 (단순화)
        function handleCanadaTouch() {
            if (canadaAnimation.touchActive) {
                // 이미 활성화된 상태면 비활성화
                canadaAnimation.touchActive = false;
                executeCanadaHide();
            } else {
                // 다른 지역 비활성화
                newzealandAnimation.touchActive = false;
                executeNewzealandHide();

                // 현재 지역 활성화
                canadaAnimation.touchActive = true;
                showCanadaAnimation();
            }
        }

        function handleNewzealandTouch() {
            if (newzealandAnimation.touchActive) {
                // 이미 활성화된 상태면 비활성화
                newzealandAnimation.touchActive = false;
                executeNewzealandHide();
            } else {
                // 다른 지역 비활성화
                canadaAnimation.touchActive = false;
                executeCanadaHide();

                // 현재 지역 활성화
                newzealandAnimation.touchActive = true;
                showNewzealandAnimation();
            }
        }

        // 초기 설정
        initializeElements();

        // 캐나다 원 이벤트
        if (canadaCircle) {
            // 데스크톱 호버 이벤트
            canadaCircle.addEventListener("mouseenter", showCanadaAnimation);
            canadaCircle.addEventListener("mouseleave", hideCanadaAnimation);

            // 모바일 클릭/터치 이벤트
            canadaCircle.addEventListener("click", handleCanadaTouch);
            canadaCircle.addEventListener("touchend", function (e) {
                e.preventDefault();
                handleCanadaTouch();
            });

            canadaCircle.style.cursor = "pointer";
        }

        // 뉴질랜드 원 이벤트
        if (newzealandCircle) {
            // 데스크톱 호버 이벤트
            newzealandCircle.addEventListener(
                "mouseenter",
                showNewzealandAnimation
            );
            newzealandCircle.addEventListener(
                "mouseleave",
                hideNewzealandAnimation
            );

            // 모바일 클릭/터치 이벤트
            newzealandCircle.addEventListener("click", handleNewzealandTouch);
            newzealandCircle.addEventListener("touchend", function (e) {
                e.preventDefault();
                handleNewzealandTouch();
            });

            newzealandCircle.style.cursor = "pointer";
        }

        // 지도 외부 클릭 시 모든 애니메이션 숨기기 (모바일용)
        document.addEventListener("click", function (e) {
            const mapContainer = document.getElementById("map-container");
            if (mapContainer && !mapContainer.contains(e.target)) {
                canadaAnimation.touchActive = false;
                newzealandAnimation.touchActive = false;
                executeCanadaHide();
                executeNewzealandHide();
            }
        });
    }

    // 스크롤 인디케이터 클릭 이벤트
    function scrollIndicator() {
        const scrollIcon = document.querySelector(".scroll-icon");
        const scrollText = document.querySelector(".scroll-text");

        if (scrollIcon) {
            scrollIcon.addEventListener("click", function () {
                const brandSection = document.getElementById("brand");
                if (brandSection) {
                    const offsetTop = brandSection.offsetTop;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: "smooth",
                    });
                }
            });
        }

        if (scrollText) {
            scrollText.addEventListener("click", function () {
                const brandSection = document.getElementById("brand");
                if (brandSection) {
                    const offsetTop = brandSection.offsetTop;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: "smooth",
                    });
                }
            });
        }
    }

    // 간단한 Smooth Scroll 네비게이션
    function initSimpleSmoothScroll() {
        const navLinks = document.querySelectorAll(
            '.nav-link[href="#main"], .nav-link[href="#brand"], .nav-link[href="#journey"]'
        );

        navLinks.forEach((link) => {
            link.addEventListener("click", function (e) {
                e.preventDefault();

                const targetId = this.getAttribute("href").substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop,
                        behavior: "smooth",
                    });
                }
            });
        });

        console.log(`Smooth scroll 적용 완료: ${navLinks.length}개 링크`);
    }

    // 스크롤 애니메이션 효과
    function scrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        };

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        }, observerOptions);

        // 애니메이션할 요소들 선택 (브랜드 요소들은 별도 처리)
        const animatedElements = document.querySelectorAll(
            [
                ".bw-product-item",
                ".process-step",
                ".origin-content",
                ".news-item",
                ".faq-item",
            ].join(", ")
        );

        animatedElements.forEach((element, index) => {
            element.style.opacity = "0";
            element.style.transform = "translateY(30px)";
            element.style.transition = `opacity 0.6s ease ${
                index * 0.1
            }s, transform 0.6s ease ${index * 0.1}s`;

            observer.observe(element);
        });
    }

    // 프로세스 섹션 상태 관리 (단순화)
    let processAnimation = {
        state: "idle", // 'idle', 'transitioning'
        currentStep: "1",
        timers: [],
    };

    // 프로세스 스텝 인터랙션 효과
    function processStepEffects() {
        const processSteps = document.querySelectorAll(".process-step");

        processSteps.forEach((step) => {
            step.addEventListener("click", function () {
                const stepNumber = this.getAttribute("data-step");

                // 현재 스텝과 같거나 애니메이션 진행 중이면 무시
                if (
                    stepNumber === processAnimation.currentStep ||
                    processAnimation.state === "transitioning"
                ) {
                    return;
                }

                // 스텝 활성화 및 이미지 전환
                activateProcessStep(stepNumber, processSteps);
            });
        });

        console.log(`프로세스 스텝 ${processSteps.length}개 초기화 완료`);
    }

    // 프로세스 스텝 활성화
    function activateProcessStep(stepNumber, processSteps) {
        // 상태 및 타이머 정리
        clearProcessTimers();
        processAnimation.state = "transitioning";
        processAnimation.currentStep = stepNumber;

        // 모든 스텝에서 active 클래스 제거
        processSteps.forEach((s) => s.classList.remove("active"));

        // 현재 스텝에 active 클래스 추가
        const targetStep = document.querySelector(
            `.process-step[data-step="${stepNumber}"]`
        );
        if (targetStep) {
            targetStep.classList.add("active");
        }

        // 이미지 전환 실행
        executeProcessImageTransition(stepNumber);
    }

    // 프로세스 이미지 전환 실행
    function executeProcessImageTransition(stepNumber) {
        const processImages = document.querySelectorAll(".process-image");
        const targetImage = document.querySelector(
            `.process-image[data-step="${stepNumber}"]`
        );
        const currentActiveImage = document.querySelector(
            ".process-image.active"
        );

        if (!targetImage || targetImage === currentActiveImage) {
            processAnimation.state = "idle";
            return;
        }

        // 1단계: 현재 이미지 페이드아웃 처리 (즉시)
        if (currentActiveImage) {
            currentActiveImage.classList.add("fade-out");
            currentActiveImage.classList.remove("active");
        }

        // 2단계: 새 이미지 초기 위치 설정 (즉시)
        targetImage.style.transform = "translateX(100%)";
        targetImage.style.opacity = "1";

        // 강제 리플로우
        targetImage.offsetHeight;

        // 3단계: 슬라이드 애니메이션 시작 (즉시)
        targetImage.classList.add("slide-in");
        targetImage.style.transform = "translateX(0)";

        // 4단계: 애니메이션 완료 후 정리 (800ms 후)
        const cleanupTimer = setTimeout(() => {
            // 모든 이미지 상태 정리
            processImages.forEach((img) => {
                if (img !== targetImage) {
                    img.classList.remove("active", "fade-out", "slide-in");
                    img.style.opacity = "0";
                    img.style.transform = "translateX(100%)";
                }
            });

            // 새 이미지를 active로 설정
            targetImage.classList.remove("slide-in");
            targetImage.classList.add("active");

            // 상태 초기화
            processAnimation.state = "idle";

            console.log(`프로세스 스텝 ${stepNumber} 전환 완료`);
        }, 800);

        processAnimation.timers.push(cleanupTimer);
    }

    // 프로세스 타이머 정리
    function clearProcessTimers() {
        processAnimation.timers.forEach((timer) => clearTimeout(timer));
        processAnimation.timers = [];
    }

    // 제품 이미지 호버 효과
    function productImageEffects() {
        const productItems = document.querySelectorAll(".bw-product-item");

        productItems.forEach((item) => {
            const image = item.querySelector(".bw-product-image");

            item.addEventListener("mouseenter", function () {
                image.style.transform = "scale(1.05)";
                image.style.transition = "transform 0.3s ease";
            });

            item.addEventListener("mouseleave", function () {
                image.style.transform = "scale(1)";
            });
        });
    }

    // 맵 도트 애니메이션
    function mapDotAnimations() {
        const mapDots = document.querySelectorAll(".map-dot");

        mapDots.forEach((dot, index) => {
            setInterval(() => {
                dot.style.transform = "scale(1.2)";
                dot.style.boxShadow = "0 0 20px rgba(229, 184, 116, 0.6)";

                setTimeout(() => {
                    dot.style.transform = "scale(1)";
                    dot.style.boxShadow = "none";
                }, 1000);
            }, 3000 + index * 1500); // 각 도트마다 다른 타이밍

            dot.style.transition = "all 0.5s ease";
        });
    }

    // 뉴스 아이템 클릭 효과
    function newsItemEffects() {
        const newsItems = document.querySelectorAll(".news-item");

        newsItems.forEach((item) => {
            item.addEventListener("click", function () {
                // 실제로는 뉴스 상세 페이지로 이동하는 로직을 여기에 추가
                console.log(
                    "뉴스 아이템 클릭:",
                    this.querySelector("h3").textContent
                );

                // 클릭 효과
                this.style.transform = "scale(0.98)";
                setTimeout(() => {
                    this.style.transform = "scale(1)";
                }, 150);
            });

            item.style.cursor = "pointer";
            item.style.transition = "transform 0.15s ease";
        });
    }

    // 버튼 호버 효과 강화
    function enhanceButtonEffects() {
        const buttons = document.querySelectorAll(".btn");

        buttons.forEach((button) => {
            button.addEventListener("mouseenter", function () {
                this.style.transform = "translateY(-2px)";
                this.style.boxShadow = "0 4px 15px rgba(229, 184, 116, 0.3)";
            });

            button.addEventListener("mouseleave", function () {
                this.style.transform = "translateY(0)";
                this.style.boxShadow = "none";
            });

            button.addEventListener("mousedown", function () {
                this.style.transform = "translateY(0)";
            });

            button.addEventListener("mouseup", function () {
                this.style.transform = "translateY(-2px)";
            });
        });
    }

    // 모바일 메뉴 토글 (필요시)
    function mobileMenuToggle() {
        // 모바일에서 햄버거 메뉴가 필요한 경우 여기에 구현
        const screenWidth = window.innerWidth;

        if (screenWidth <= 768) {
            const navMenu = document.querySelector(".nav-menu");

            // 모바일에서는 메뉴를 숨기고 토글 버튼 추가 가능
            // 현재는 기본 반응형 스타일로 처리됨
        }
    }

    // 페이지 로드 프로그레스 표시
    function pageLoadProgress() {
        const progressBar = document.createElement("div");
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #E5B874, #37000A);
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener("scroll", function () {
            const scrollPercent =
                (window.scrollY /
                    (document.documentElement.scrollHeight -
                        window.innerHeight)) *
                100;
            progressBar.style.width = scrollPercent + "%";
        });
    }

    // 스크롤 페이드인 애니메이션 설정
    function setupScrollAnimations() {
        // Intersection Observer 설정
        const observerOptions = {
            root: null,
            rootMargin: "-50px 0px",
            threshold: 0.1,
        };

        // 제품 섹션 애니메이션 함수
        function animateProductSection(entries, observer) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target;

                    if (element.classList.contains("bw-product-header")) {
                        element.classList.add("fade-in");

                        // 헤더가 나타난 후 0.5초 뒤에 스와이퍼 애니메이션
                        setTimeout(() => {
                            const swiper =
                                document.querySelector(".bw-product-swiper");
                            if (swiper) {
                                swiper.classList.add("fade-in");

                                // 스와이퍼가 나타난 후 개별 카드 애니메이션
                                setTimeout(() => {
                                    const productCards =
                                        document.querySelectorAll(
                                            ".bw-product-card"
                                        );
                                    productCards.forEach((card) => {
                                        card.classList.add("fade-in-stagger");
                                    });
                                }, 400);
                            }
                        }, 500);
                    }

                    // 한 번 애니메이션이 실행되면 관찰 중지
                    observer.unobserve(element);
                }
            });
        }

        // 일반 요소들을 위한 페이드인 함수
        function fadeInElement(entries, observer) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }

        // Observer 생성
        const productObserver = new IntersectionObserver(
            animateProductSection,
            observerOptions
        );
        const generalObserver = new IntersectionObserver(
            fadeInElement,
            observerOptions
        );

        // 제품 헤더 관찰 시작
        const productHeader = document.querySelector(".bw-product-header");
        if (productHeader) {
            productObserver.observe(productHeader);
        }

        // 일반 페이드인 요소들 관찰
        const fadeElements = document.querySelectorAll(".fade-in-element");
        fadeElements.forEach((element) => {
            generalObserver.observe(element);
        });
    }

    // 화면 크기 변경 시 지도 재로드
    let currentIsMobile = window.innerWidth <= 768;

    function handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        // 모바일/데스크톱 상태가 변경된 경우에만 지도 재로드
        if (currentIsMobile !== newIsMobile) {
            currentIsMobile = newIsMobile;
            loadMapSVG();
        }
    }

    // 히어로 컨텐츠 타이밍 애니메이션
    function initHeroContentAnimation() {
        const heroContent = document.querySelector(".hero-content");
        if (!heroContent) return;

        // 초기 상태 설정 (숨김)
        heroContent.style.opacity = "0";
        heroContent.style.transform = "translateY(30px)";
        heroContent.style.transition = "opacity 1s ease, transform 1s ease";

        // 로딩 완료 후 4초 후 나타나는 애니메이션 (1초간)
        setTimeout(() => {
            heroContent.style.opacity = "1";
            heroContent.style.transform = "translateY(0)";
            console.log("히어로 컨텐츠 나타남");
        }, 5500);

        // 로딩 완료 후 7.5초 후 사라지는 애니메이션 (1초간)
        setTimeout(() => {
            heroContent.style.opacity = "0";
            heroContent.style.transform = "translateY(-30px)";
            console.log("히어로 컨텐츠 사라짐");
        }, 11000);
    }

    // 모든 기능 초기화
    function init() {
        scrollIndicator();
        scrollAnimations();
        processStepEffects();
        productImageEffects();
        mapDotAnimations();
        newsItemEffects();
        enhanceButtonEffects();
        mobileMenuToggle();
        pageLoadProgress();
        initScrollAnimations();
        initBWProductSwiper();
        initHeroContentAnimation(); // 히어로 컨텐츠 애니메이션 초기화
        loadMapSVG(); // SVG 지도 동적 로드
        setupScrollAnimations(); // 제품 섹션 페이드인 애니메이션
        initSimpleSmoothScroll(); // 간단한 Smooth Scroll 네비게이션 초기화

        // 창 크기 변경 시 지도 재로드
        window.addEventListener("resize", handleResize);

        console.log("아포제 웹사이트가 성공적으로 로드되었습니다.");
    }

    // 초기화 실행
    init();

    // 윈도우 리사이즈 이벤트
    window.addEventListener("resize", function () {
        mobileMenuToggle();
    });
}

// DOM 로드 완료 후 실행 (로딩 애니메이션이 없는 경우 대비)
document.addEventListener("DOMContentLoaded", function () {
    // 로딩 애니메이션이 실행 중이 아니라면 바로 초기화
    if (!window.ApogeeLoader || !document.getElementById("apogee-loader")) {
        initializeMainPage();
    }
});

// 로딩 애니메이션 완료 후 메인 페이지 초기화
window.addEventListener("apogeeLoadingComplete", function () {
    initializeMainPage();
});

// 외부에서 접근 가능한 유틸리티 함수들
window.ApogeeUtils = {
    // 특정 섹션으로 스크롤
    scrollToSection: function (sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
            });
        }
    },

    // 현재 활성 섹션 가져오기
    getCurrentSection: function () {
        const sections = document.querySelectorAll("section[id]");
        const scrollPosition = window.scrollY + 150;

        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionTop + sectionHeight
            ) {
                return section.getAttribute("id");
            }
        }
        return null;
    },
};

// 문의하기 모달 기능
function openContactModal() {
    const modal = document.getElementById("contactModal");
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // 스크롤 방지
    }
}

function closeContactModal() {
    const modal = document.getElementById("contactModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto"; // 스크롤 복원
        // 폼 리셋
        const form = document.getElementById("contactForm");
        if (form) form.reset();
        // 개인 선택으로 초기화
        selectContactType("개인");
    }
}

// 모달 외부 클릭 시 닫기
document.addEventListener("click", function (e) {
    const contactModal = document.getElementById("contactModal");
    const privacyModal = document.getElementById("privacyModal");
    const modalPanel = document.querySelector(".modal-panel");
    const privacyModalPanel = document.querySelector(".privacy-modal-panel");

    // 문의하기 모달 처리
    if (contactModal && contactModal.classList.contains("active")) {
        if (
            e.target.classList.contains("modal-overlay") ||
            (e.target === contactModal && !modalPanel.contains(e.target))
        ) {
            closeContactModal();
        }
    }

    // 개인정보 모달 처리
    if (privacyModal && privacyModal.classList.contains("active")) {
        if (
            e.target.classList.contains("modal-overlay") ||
            (e.target === privacyModal && !privacyModalPanel.contains(e.target))
        ) {
            closePrivacyModal();
        }
    }
});

// ESC 키로 모달 닫기
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        const contactModal = document.getElementById("contactModal");
        const privacyModal = document.getElementById("privacyModal");

        if (contactModal && contactModal.classList.contains("active")) {
            closeContactModal();
        }

        if (privacyModal && privacyModal.classList.contains("active")) {
            closePrivacyModal();
        }
    }
});

// 개인정보 처리방침 모달 기능
function openPrivacyModal() {
    const modal = document.getElementById("privacyModal");
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // 스크롤 방지
    }
}

function closePrivacyModal() {
    const modal = document.getElementById("privacyModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto"; // 스크롤 복원
    }
}

function agreeAndClosePrivacyModal() {
    // 개인정보 동의 체크박스를 체크
    const privacyCheckbox = document.getElementById("privacy");
    if (privacyCheckbox) {
        privacyCheckbox.checked = true;
    }

    // 폼 유효성 다시 체크
    validateContactForm();

    // 모달 닫기
    closePrivacyModal();
}

/**
 * Contact API Interface
 *
 * interface ContactRequest {
 *   type: 'PERSONAL' | 'BUSINESS';
 *   name: string;
 *   phone: string;
 *   content: string;
 * }
 *
 * 성공 응답 (201):
 * {
 *   "success": true,
 *   "message": "문의사항이 성공적으로 접수되었습니다.",
 *   "data": {
 *     "id": "clxxxxx",
 *     "createdAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */

// 개인/기업 선택 함수
function selectContactType(type) {
    const buttons = document.querySelectorAll(".contact-type-btn");
    buttons.forEach((btn) => btn.classList.remove("active"));

    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    if (selectedBtn) selectedBtn.classList.add("active");

    const nameLabel = document.getElementById("nameLabel");
    const nameInput = document.getElementById("name");

    if (type === "개인") {
        nameLabel.textContent = "성함";
        nameInput.placeholder = "성함을 입력하세요";
    } else {
        nameLabel.textContent = "기업명";
        nameInput.placeholder = "기업명을 입력하세요";
    }
}

// 폼 제출 함수
async function submitContactForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // 선택된 타입을 API 스펙에 맞게 변환
    const selectedType =
        document.querySelector(".contact-type-btn.active")?.dataset.type ||
        "개인";

    const apiType = selectedType === "개인" ? "PERSONAL" : "BUSINESS";

    // 새로운 API 인터페이스에 맞게 데이터 구성
    const data = {
        type: apiType,
        name: formData.get("name"),
        phone: formData.get("phone"),
        content: formData.get("message"), // message를 content로 변경
    };

    try {
        const response = await fetch(
            "https://before-cafe24.vercel.app/api/apogee/contact",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (response.ok) {
            const result = await response.json();
            alert("문의사항이 성공적으로 접수되었습니다.");
            form.reset(); // 폼 초기화
            validateContactForm(); // 버튼 상태 초기화
            closeContactModal();
        } else {
            // 상세한 에러 처리
            const errorData = await response.json().catch(() => ({}));
            let errorMessage = "문의 전송에 실패했습니다.";

            switch (response.status) {
                case 400:
                    errorMessage =
                        "입력 정보를 확인해주세요. 필수 항목이 누락되었거나 형식이 올바르지 않습니다.";
                    break;
                case 403:
                    errorMessage = "접근이 허용되지 않습니다.";
                    break;
                case 404:
                    errorMessage = "서비스를 찾을 수 없습니다.";
                    break;
                case 500:
                    errorMessage =
                        "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                    break;
                default:
                    errorMessage =
                        errorData.message ||
                        "문의 전송에 실패했습니다. 다시 시도해주세요.";
            }

            alert(errorMessage);
        }
    } catch (error) {
        console.error("Contact form submission error:", error);
        alert(
            "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요."
        );
    }
}

// 폼 필드 유효성 검사 및 버튼 활성화
function validateContactForm() {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const privacyCheckbox = document.getElementById("privacy");
    const submitBtn = document.querySelector(".modal-submit-btn");

    if (
        !nameInput ||
        !phoneInput ||
        !messageInput ||
        !privacyCheckbox ||
        !submitBtn
    ) {
        return;
    }

    // 모든 필드가 채워져 있는지 확인
    const isNameFilled = nameInput.value.trim() !== "";
    const isPhoneFilled = phoneInput.value.trim() !== "";
    const isMessageFilled = messageInput.value.trim() !== "";
    const isPrivacyChecked = privacyCheckbox.checked;

    const isFormValid =
        isNameFilled && isPhoneFilled && isMessageFilled && isPrivacyChecked;

    // 버튼 활성화/비활성화
    if (isFormValid) {
        submitBtn.classList.add("active");
    } else {
        submitBtn.classList.remove("active");
    }
}

// 폼 필드에 이벤트 리스너 추가
function addFormValidationListeners() {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const privacyCheckbox = document.getElementById("privacy");

    // 각 필드에 input 이벤트 리스너 추가
    if (nameInput) {
        nameInput.addEventListener("input", validateContactForm);
    }
    if (phoneInput) {
        phoneInput.addEventListener("input", validateContactForm);
    }
    if (messageInput) {
        messageInput.addEventListener("input", validateContactForm);
    }
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener("change", validateContactForm);
    }
}

// 폼 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", submitContactForm);
        // 폼 유효성 검사 리스너 추가
        addFormValidationListeners();
        // 초기 상태 체크
        validateContactForm();
    }
});

// 전역 함수로 등록 (HTML onclick에서 사용하기 위해)
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.selectContactType = selectContactType;
window.openPrivacyModal = openPrivacyModal;
window.closePrivacyModal = closePrivacyModal;
window.agreeAndClosePrivacyModal = agreeAndClosePrivacyModal;

// 스크롤 애니메이션 초기화
function initScrollAnimations() {
    // 브랜드 섹션 애니메이션
    const brandElements = document.querySelectorAll(
        ".brand-left, .brand-content"
    );

    // 초기 상태 설정
    brandElements.forEach((element) => {
        console.log("초기 상태 설정:", element.className);
        element.style.opacity = "0";
        if (element.classList.contains("brand-left")) {
            // 왼쪽은 제자리에서 페이드인
            element.style.transform = "none";
        } else {
            // 오른쪽은 아래에서 위로
            element.style.transform = "translateY(100px)";
        }
    });

    // Intersection Observer 생성
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = entry.target;

                    if (target.classList.contains("brand-intro")) {
                        // 브랜드 섹션이 보이면 순차적으로 애니메이션 실행
                        animateBrandElements();
                    }
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -150px 0px",
        }
    );

    // 브랜드 섹션 관찰
    const brandSection = document.querySelector(".brand-intro");
    if (brandSection) {
        observer.observe(brandSection);
    }
}

// 브랜드 요소들의 애니메이션
function animateBrandElements() {
    // 왼쪽 즉시 페이드인
    const leftElement = document.querySelector(".brand-left");
    if (leftElement) {
        leftElement.style.transition =
            "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        leftElement.style.opacity = "1";
        leftElement.style.transform = "none";
    }

    // 오른쪽 1.2초 후 슬라이드인
    console.log("1.2초 타이머 설정됨");
    setTimeout(() => {
        const rightElement = document.querySelector(".brand-content");
        if (rightElement) {
            rightElement.style.transition =
                "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            rightElement.style.opacity = "1";
            rightElement.style.transform = "translateY(0)";
        } else {
        }
    }, 800);
}

// Swiper 제품 슬라이더 초기화
let bwProductSwiper = null;

function initBWProductSwiper() {
    // Swiper 초기화
    bwProductSwiper = new Swiper(".bw-product-swiper", {
        slidesPerView: 2.3,
        spaceBetween: 30,
        centeredSlides: false,
        loop: true,
        autoplay: {
            delay: 1000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
        },
        speed: 800,

        // 반응형 설정
        breakpoints: {
            320: {
                slidesPerView: 1.3,
                spaceBetween: 10,
                centeredSlides: false,
            },
            768: {
                slidesPerView: 1.5,
                spaceBetween: 10,
                centeredSlides: true,
            },
            1024: {
                slidesPerView: 2.3,
                spaceBetween: 15,
                centeredSlides: false,
            },
            1400: {
                slidesPerView: 2.3,
                spaceBetween: 20,
                centeredSlides: false,
            },
        },

        // 페이지네이션 - 프로그레스바
        pagination: {
            el: ".bw-swiper-pagination",
            type: "progressbar",
        },

        // 터치/마우스 상호작용
        grabCursor: true,

        // 키보드 컨트롤
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },

        // 자동 높이
        autoHeight: false,

        // 효과
        effect: "slide",

        // 이벤트
        on: {
            init: function () {
                console.log("Product Swiper 초기화 완료");
                // 초기화 시 자동재생 중지
                this.autoplay.stop();
            },
            slideChange: function () {
                // 슬라이드 변경 시 카드 애니메이션 효과
                const activeSlide = this.slides[this.activeIndex];
                if (activeSlide) {
                    const card = activeSlide.querySelector(".bw-product-card");
                    if (card) {
                        card.style.transform = "scale(1.02)";
                        setTimeout(() => {
                            card.style.transform = "scale(1)";
                        }, 300);
                    }
                }
            },
        },
    });

    // Intersection Observer로 스크롤 시 자동재생 시작
    const productSection = document.querySelector(".bw-product-section");
    if (productSection) {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: "0px",
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // 섹션이 보이면 자동재생 시작
                    if (bwProductSwiper && !bwProductSwiper.autoplay.running) {
                        bwProductSwiper.autoplay.start();
                        console.log("Product Swiper 자동재생 시작");
                    }
                } else {
                    // 섹션이 안 보이면 자동재생 중지
                    if (bwProductSwiper && bwProductSwiper.autoplay.running) {
                        bwProductSwiper.autoplay.stop();
                        console.log("Product Swiper 자동재생 중지");
                    }
                }
            });
        }, observerOptions);

        observer.observe(productSection);
    }
}

// Swiper 제어 함수들
function startProductAutoplay() {
    if (bwProductSwiper) {
        bwProductSwiper.autoplay.start();
    }
}

function stopProductAutoplay() {
    if (bwProductSwiper) {
        bwProductSwiper.autoplay.stop();
    }
}

function nextProductSlide() {
    if (bwProductSwiper) {
        bwProductSwiper.slideNext();
    }
}

function prevProductSlide() {
    if (bwProductSwiper) {
        bwProductSwiper.slidePrev();
    }
}

// 전역 함수로 등록
window.startProductAutoplay = startProductAutoplay;
window.stopProductAutoplay = stopProductAutoplay;
window.nextProductSlide = nextProductSlide;
window.prevProductSlide = prevProductSlide;
