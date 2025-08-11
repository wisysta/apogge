// Journey 페이지 새로운 인터랙션 스크립트

document.addEventListener("DOMContentLoaded", function () {
    // 스크롤 복원 방지
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    // 요소 선택
    const journeySteps = document.querySelectorAll(".journey-step");
    const detailSections = document.querySelectorAll(".journey-detail-section");

    // 스크롤 타이머 관리
    let scrollTimer = null;
    let isScrolling = false;

    // 초기화: 배경 이미지 설정
    function initializeBackgrounds() {
        detailSections.forEach((section) => {
            const imagePath = section.getAttribute("data-image");
            const background = section.querySelector(".section-background");
            if (background && imagePath) {
                background.style.backgroundImage = `url('${imagePath}')`;
            }
        });
    }

    // 섹션 확장 함수
    function expandSection(sectionId) {
        // 이미 스크롤 중이면 무시
        if (isScrolling) {
            return;
        }

        // 모든 섹션 축소
        detailSections.forEach((section) => {
            section.classList.remove("expanded");
            section.classList.add("collapsed");
        });

        // 스크롤 플래그 설정
        isScrolling = true;

        // 이전 스크롤 타이머 취소
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }

        // 먼저 스크롤 실행 (섹션 확장 전)
        scrollToSectionByIndex(sectionId);

        // 스크롤 완료 후 섹션 확장
        setTimeout(() => {
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.remove("collapsed");
                targetSection.classList.add("expanded");
            }

            // 섹션 확장 완료 후 플래그 해제
            setTimeout(() => {
                isScrolling = false;
            }, 400); // CSS 트랜지션 시간에 맞춰 조정
        }, 300); // 스크롤 애니메이션 시간
    }

    // 섹션 축소 함수
    function collapseSection(section) {
        section.classList.remove("expanded");
        section.classList.add("collapsed");
    }

    // 모든 섹션 축소 함수
    function collapseAllSections() {
        detailSections.forEach((section) => {
            section.classList.remove("expanded");
            section.classList.add("collapsed");
        });
    }

    // 히어로 섹션 스텝 클릭 이벤트
    journeySteps.forEach((step) => {
        step.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");
            if (targetId) {
                expandSection(targetId);
            }
        });
    });

    // 상세 섹션 클릭 이벤트 (축소 상태에서만)
    detailSections.forEach((section) => {
        section.addEventListener("click", function (e) {
            // 확장된 상태에서는 클릭 이벤트 무시
            if (this.classList.contains("expanded")) {
                return;
            }

            const sectionId = this.getAttribute("id");
            if (sectionId) {
                expandSection(sectionId);
            }
        });
    });

    // ESC 키로 섹션 닫기
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            const expandedSection = document.querySelector(
                ".journey-detail-section.expanded"
            );
            if (expandedSection) {
                collapseSection(expandedSection);
            }
        }
    });

    // 헤더 스크롤 효과 (기존 기능 유지)
    const header = document.querySelector(".header");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        if (header) {
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header.style.transform = "translateY(-100%)";
            } else {
                header.style.transform = "translateY(0)";
            }
        }

        lastScrollY = currentScrollY;
    });

    // 페이지 로드 시 초기화
    initializeBackgrounds();

    // 브라우저 크기 변경 시 최적화
    window.addEventListener("resize", function () {
        // 모바일에서는 자동으로 축소하여 성능 최적화
        if (window.innerWidth < 768) {
            detailSections.forEach((section) => {
                section.classList.remove("expanded");
                section.classList.add("collapsed");
            });
        }
    });

    // 단순한 스크롤 함수
    function scrollToSection(target) {
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: "smooth",
            });
        }
    }

    // 섹션 인덱스 기반 스크롤 함수 (collapsed 상태 기준 계산)
    function scrollToSectionByIndex(sectionId) {
        const isMobile = window.innerWidth <= 768;
        const heroHeight =
            document.querySelector(".journey-hero")?.offsetHeight ||
            window.innerHeight;
        const sectionIndex = parseInt(sectionId.replace("step", "")) - 1;

        let targetPosition;

        if (isMobile) {
            // 모바일: collapsed 높이(30vh) 기준으로 계산
            const collapsedHeight = window.innerHeight * 0.3;
            targetPosition = heroHeight + sectionIndex * collapsedHeight;
            // 모바일에서 약간의 오프셋으로 섹션 상단이 잘 보이도록
            targetPosition = Math.max(0, targetPosition - 10);
        } else {
            // 데스크톱: collapsed 높이(50vh) 기준으로 계산 (다른 확장된 섹션 영향 제거)
            const collapsedHeight = window.innerHeight * 0.5;
            targetPosition = heroHeight + sectionIndex * collapsedHeight;
        }

        window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
        });
    }

    // 지역 소개 섹션 초기화
    initializeOriginSection();

    // 페이지 진입 애니메이션
    const heroSection = document.querySelector(".journey-hero");
    if (heroSection) {
        // 페이지 로드 후 자연스러운 페이드 인
        setTimeout(() => {
            heroSection.classList.add("loaded");
        }, 300);
    }

    console.log("Journey 페이지 스크립트 로드 완료");

    // 지역 소개 섹션 로직
    function initializeOriginSection() {
        loadMapSVG();
    }

    // SVG 동적 로드
    function loadMapSVG() {
        const mapContainer = document.getElementById("map-container");
        if (!mapContainer) return;

        // 화면 크기에 따라 다른 SVG 파일 선택
        const isMobile = window.innerWidth <= 768;
        const svgPath = isMobile
            ? "https://ecimg.cafe24img.com/pg2069b88099925051/cerezia/images/map-mo-final.svg"
            : "https://ecimg.cafe24img.com/pg2069b88099925051/cerezia/images/map-pc.svg";

        fetch(svgPath)
            .then((response) => response.text())
            .then((svgText) => {
                mapContainer.innerHTML = svgText;
                setupMapInteractions();
            })
            .catch((error) => {
                console.error("SVG 로드 실패:", error);
            });
    }

    // 지도 상호작용 설정 (index.js 방식 참고)
    function setupMapInteractions() {
        const svg = document.querySelector("#map-container svg");
        if (!svg) {
            console.error("SVG 요소를 찾을 수 없습니다");
            return;
        }

        console.log("SVG 로딩 성공, 내용 길이:", svg.outerHTML.length);

        // index.js와 동일한 방식으로 요소 선택 + 마커 요소도 추가
        const canadaCircle = svg.querySelector("#canada-circle");
        const canadaMarker = svg.querySelector("#canada-marker");
        const canadaDottedLine = svg.querySelector("#canada-dottted-line");
        const canadaText = svg.querySelector("#canada-text");

        const newzealandCircle = svg.querySelector("#newzealand-circle");
        const newzealandMarker = svg.querySelector("#newzealand-marker");
        const newzealandDottedLine = svg.querySelector(
            "#newzealand-dottted-line"
        );
        const newzealandText = svg.querySelector("#newzealand-text");

        // 지역 세부 정보 요소들 (journey 페이지 전용)
        const newzealandDetail = document.getElementById("newzealand-detail");
        const canadaDetail = document.getElementById("canada-detail");

        // 각 지역별 애니메이션 상태 관리 (index.js와 동일)
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

        // 현재 활성화된 세부 정보 (journey 페이지 전용)
        let activeDetail = null;

        // 초기 설정 (index.js와 동일)
        function initializeElements() {
            if (canadaDottedLine) {
                canadaDottedLine.style.opacity = "0";
                canadaDottedLine.style.transition = "opacity 0.6s ease";
            }
            if (canadaText) {
                canadaText.style.opacity = "0";
                canadaText.style.transform = "translateY(15px)";
                canadaText.style.transition =
                    "opacity 0.5s ease, transform 0.5s ease";
            }
            if (newzealandDottedLine) {
                newzealandDottedLine.style.opacity = "0";
                newzealandDottedLine.style.transition = "opacity 0.6s ease";
            }
            if (newzealandText) {
                newzealandText.style.opacity = "0";
                newzealandText.style.transform = "translateY(15px)";
                newzealandText.style.transition =
                    "opacity 0.5s ease, transform 0.5s ease";
            }
        }

        // 캐나다 애니메이션 함수들 (index.js와 동일하지만 호버시 디테일도 표시)
        function showCanadaAnimation() {
            if (
                canadaAnimation.state === "showing" ||
                canadaAnimation.state === "shown"
            ) {
                return;
            }
            clearCanadaTimers();
            canadaAnimation.state = "showing";
            executeCanadaShow();

            // 호버시 디테일 표시 (0.7초 지연)
            if (canadaDetail) {
                const detailTimer = setTimeout(() => {
                    // 다른 디테일이 활성화되어 있으면 닫기
                    if (activeDetail && activeDetail !== canadaDetail) {
                        activeDetail.classList.remove("active");
                    }
                    canadaDetail.classList.add("active");
                    activeDetail = canadaDetail;
                }, 500);
                canadaAnimation.timers.push(detailTimer);
            }
        }

        function hideCanadaAnimation() {
            if (canadaAnimation.touchActive) {
                return;
            }
            if (canadaAnimation.state === "showing") {
                const delayTimer = setTimeout(() => {
                    executeCanadaHide();
                    hideCanadaDetail();
                }, 500);
                canadaAnimation.timers.push(delayTimer);
                return;
            }
            if (canadaAnimation.state === "hiding") {
                return;
            }
            executeCanadaHide();
            hideCanadaDetail();
        }

        // 캐나다 디테일 숨기기 함수
        function hideCanadaDetail() {
            if (
                canadaDetail &&
                activeDetail === canadaDetail &&
                !canadaAnimation.touchActive
            ) {
                canadaDetail.classList.remove("active");
                activeDetail = null;
            }
        }

        function executeCanadaShow() {
            if (canadaDottedLine) {
                canadaDottedLine.style.opacity = "1";
            }
            const textTimer = setTimeout(() => {
                if (canadaText) {
                    canadaText.style.opacity = "1";
                    canadaText.style.transform = "translateY(0)";
                }
                const completeTimer = setTimeout(() => {
                    canadaAnimation.state = "shown";
                }, 500);
                canadaAnimation.timers.push(completeTimer);
            }, 200);
            canadaAnimation.timers.push(textTimer);
        }

        function executeCanadaHide() {
            clearCanadaTimers();
            canadaAnimation.state = "hiding";
            if (canadaText) {
                canadaText.style.opacity = "0";
                canadaText.style.transform = "translateY(15px)";
            }
            const lineTimer = setTimeout(() => {
                if (canadaDottedLine) {
                    canadaDottedLine.style.opacity = "0";
                }
                const resetTimer = setTimeout(() => {
                    canadaAnimation.state = "idle";
                }, 600);
                canadaAnimation.timers.push(resetTimer);
            }, 100);
            canadaAnimation.timers.push(lineTimer);
        }

        function clearCanadaTimers() {
            canadaAnimation.timers.forEach((timer) => clearTimeout(timer));
            canadaAnimation.timers = [];
        }

        // 뉴질랜드 애니메이션 함수들 (index.js와 동일하지만 호버시 디테일도 표시)
        function showNewzealandAnimation() {
            if (
                newzealandAnimation.state === "showing" ||
                newzealandAnimation.state === "shown"
            ) {
                return;
            }
            clearNewzealandTimers();
            newzealandAnimation.state = "showing";
            executeNewzealandShow();

            // 호버시 디테일 표시 (0.7초 지연)
            if (newzealandDetail) {
                const detailTimer = setTimeout(() => {
                    // 다른 디테일이 활성화되어 있으면 닫기
                    if (activeDetail && activeDetail !== newzealandDetail) {
                        activeDetail.classList.remove("active");
                    }
                    newzealandDetail.classList.add("active");
                    activeDetail = newzealandDetail;
                }, 500);
                newzealandAnimation.timers.push(detailTimer);
            }
        }

        function hideNewzealandAnimation() {
            if (newzealandAnimation.touchActive) {
                return;
            }
            if (newzealandAnimation.state === "showing") {
                const delayTimer = setTimeout(() => {
                    executeNewzealandHide();
                    hideNewzealandDetail();
                }, 500);
                newzealandAnimation.timers.push(delayTimer);
                return;
            }
            if (newzealandAnimation.state === "hiding") {
                return;
            }
            executeNewzealandHide();
            hideNewzealandDetail();
        }

        // 뉴질랜드 디테일 숨기기 함수
        function hideNewzealandDetail() {
            if (
                newzealandDetail &&
                activeDetail === newzealandDetail &&
                !newzealandAnimation.touchActive
            ) {
                newzealandDetail.classList.remove("active");
                activeDetail = null;
            }
        }

        function executeNewzealandShow() {
            if (newzealandDottedLine) {
                newzealandDottedLine.style.opacity = "1";
            }
            const textTimer = setTimeout(() => {
                if (newzealandText) {
                    newzealandText.style.opacity = "1";
                    newzealandText.style.transform = "translateY(0)";
                }
                const completeTimer = setTimeout(() => {
                    newzealandAnimation.state = "shown";
                }, 500);
                newzealandAnimation.timers.push(completeTimer);
            }, 200);
            newzealandAnimation.timers.push(textTimer);
        }

        function executeNewzealandHide() {
            clearNewzealandTimers();
            newzealandAnimation.state = "hiding";
            if (newzealandText) {
                newzealandText.style.opacity = "0";
                newzealandText.style.transform = "translateY(15px)";
            }
            const lineTimer = setTimeout(() => {
                if (newzealandDottedLine) {
                    newzealandDottedLine.style.opacity = "0";
                }
                const resetTimer = setTimeout(() => {
                    newzealandAnimation.state = "idle";
                }, 600);
                newzealandAnimation.timers.push(resetTimer);
            }, 100);
            newzealandAnimation.timers.push(lineTimer);
        }

        function clearNewzealandTimers() {
            newzealandAnimation.timers.forEach((timer) => clearTimeout(timer));
            newzealandAnimation.timers = [];
        }

        // Journey 페이지 전용: 지역 세부 정보 토글
        function toggleRegionDetail(detailElement, region) {
            if (activeDetail === detailElement) {
                detailElement.classList.remove("active");
                activeDetail = null;
                return;
            }
            if (activeDetail) {
                activeDetail.classList.remove("active");
            }
            detailElement.classList.add("active");
            activeDetail = detailElement;
        }

        // 모바일 터치 이벤트 처리 (클릭 시 터치 상태 토글)
        function handleCanadaTouch() {
            if (canadaAnimation.touchActive) {
                canadaAnimation.touchActive = false;
                executeCanadaHide();
                hideCanadaDetail();
            } else {
                newzealandAnimation.touchActive = false;
                executeNewzealandHide();
                hideNewzealandDetail();
                canadaAnimation.touchActive = true;
                showCanadaAnimation();
            }
        }

        function handleNewzealandTouch() {
            if (newzealandAnimation.touchActive) {
                newzealandAnimation.touchActive = false;
                executeNewzealandHide();
                hideNewzealandDetail();
            } else {
                canadaAnimation.touchActive = false;
                executeCanadaHide();
                hideCanadaDetail();
                newzealandAnimation.touchActive = true;
                showNewzealandAnimation();
            }
        }

        // 초기 설정
        initializeElements();

        // 캐나다 원과 마커 이벤트 등록
        if (canadaCircle) {
            canadaCircle.addEventListener("mouseenter", showCanadaAnimation);
            canadaCircle.addEventListener("mouseleave", hideCanadaAnimation);
            canadaCircle.addEventListener("click", handleCanadaTouch);
            canadaCircle.addEventListener("touchend", function (e) {
                e.preventDefault();
                handleCanadaTouch();
            });
            canadaCircle.style.cursor = "pointer";
            console.log("캐나다 원 이벤트 등록 완료");
        } else {
            console.warn("캐나다 원 요소를 찾을 수 없습니다: #canada-circle");
        }

        // 캐나다 마커에도 동일한 이벤트 등록
        if (canadaMarker) {
            canadaMarker.addEventListener("mouseenter", showCanadaAnimation);
            canadaMarker.addEventListener("mouseleave", hideCanadaAnimation);
            canadaMarker.addEventListener("click", handleCanadaTouch);
            canadaMarker.addEventListener("touchend", function (e) {
                e.preventDefault();
                handleCanadaTouch();
            });
            canadaMarker.style.cursor = "pointer";
            console.log("캐나다 마커 이벤트 등록 완료");
        } else {
            console.warn("캐나다 마커 요소를 찾을 수 없습니다: #canada-marker");
        }

        // 뉴질랜드 원과 마커 이벤트 등록
        if (newzealandCircle) {
            newzealandCircle.addEventListener(
                "mouseenter",
                showNewzealandAnimation
            );
            newzealandCircle.addEventListener(
                "mouseleave",
                hideNewzealandAnimation
            );
            newzealandCircle.addEventListener("click", handleNewzealandTouch);
            newzealandCircle.addEventListener("touchend", function (e) {
                e.preventDefault();
                handleNewzealandTouch();
            });
            newzealandCircle.style.cursor = "pointer";
            console.log("뉴질랜드 원 이벤트 등록 완료");
        } else {
            console.warn(
                "뉴질랜드 원 요소를 찾을 수 없습니다: #newzealand-circle"
            );
        }

        // 뉴질랜드 마커에도 동일한 이벤트 등록
        if (newzealandMarker) {
            newzealandMarker.addEventListener(
                "mouseenter",
                showNewzealandAnimation
            );
            newzealandMarker.addEventListener(
                "mouseleave",
                hideNewzealandAnimation
            );
            newzealandMarker.addEventListener("click", handleNewzealandTouch);
            newzealandMarker.addEventListener("touchend", function (e) {
                e.preventDefault();
                handleNewzealandTouch();
            });
            newzealandMarker.style.cursor = "pointer";
            console.log("뉴질랜드 마커 이벤트 등록 완료");
        } else {
            console.warn(
                "뉴질랜드 마커 요소를 찾을 수 없습니다: #newzealand-marker"
            );
        }

        // Journey 페이지 전용: 배경 클릭 시 세부 정보 닫기
        const originSection = document.querySelector(".origin-section");
        if (originSection) {
            originSection.addEventListener("click", (e) => {
                if (
                    !e.target.closest(".region-detail") &&
                    !e.target.closest("#canada-circle") &&
                    !e.target.closest("#canada-marker") &&
                    !e.target.closest("#newzealand-circle") &&
                    !e.target.closest("#newzealand-marker")
                ) {
                    if (activeDetail) {
                        activeDetail.classList.remove("active");
                        activeDetail = null;
                    }
                    // 터치 상태도 해제
                    canadaAnimation.touchActive = false;
                    newzealandAnimation.touchActive = false;
                    executeCanadaHide();
                    executeNewzealandHide();
                }
            });
        }

        // 지도 외부 클릭 시 모든 애니메이션 숨기기 (index.js와 동일)
        document.addEventListener("click", function (e) {
            const mapContainer = document.getElementById("map-container");
            if (mapContainer && !mapContainer.contains(e.target)) {
                canadaAnimation.touchActive = false;
                newzealandAnimation.touchActive = false;
                executeCanadaHide();
                executeNewzealandHide();
                // Journey 페이지: 세부 정보도 닫기
                if (activeDetail) {
                    activeDetail.classList.remove("active");
                    activeDetail = null;
                }
            }
        });

        // ESC 키로 모든 상태 초기화
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                // 터치 상태 해제
                canadaAnimation.touchActive = false;
                newzealandAnimation.touchActive = false;
                executeCanadaHide();
                executeNewzealandHide();
                // Journey 페이지: 세부 정보도 닫기
                if (activeDetail) {
                    activeDetail.classList.remove("active");
                    activeDetail = null;
                }
            }
        });

        // 스크롤 시 지역 세부정보 섹션 숨기기
        let scrollTimer;
        window.addEventListener("scroll", () => {
            // 스크롤 중에는 타이머를 리셋
            clearTimeout(scrollTimer);

            // 스크롤이 멈춘 후 100ms 후에 세부정보 닫기
            scrollTimer = setTimeout(() => {
                if (activeDetail) {
                    activeDetail.classList.remove("active");
                    activeDetail = null;

                    // 지도 애니메이션 상태도 초기화
                    canadaAnimation.touchActive = false;
                    newzealandAnimation.touchActive = false;
                    executeCanadaHide();
                    executeNewzealandHide();
                }
            }, 100);
        });
    }

    // 창 크기 변경 시 SVG 다시 로드
    window.addEventListener("resize", () => {
        const mapContainer = document.getElementById("map-container");
        if (mapContainer && mapContainer.innerHTML) {
            loadMapSVG();
        }
    });
});
