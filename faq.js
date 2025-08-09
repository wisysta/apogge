// FAQ 데이터 로드 및 표시
document.addEventListener("DOMContentLoaded", function () {
    loadFAQData();
    initializeModalEvents();

    // 폼 제출 이벤트 리스너 추가
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", submitContactForm);

        // 폼 입력 필드에 이벤트 리스너 추가
        const formInputs = contactForm.querySelectorAll("input, textarea");
        formInputs.forEach((input) => {
            input.addEventListener("input", validateContactForm);
            input.addEventListener("change", validateContactForm);
        });

        // 개인정보 동의 체크박스 이벤트
        const privacyCheckbox = document.getElementById("privacy");
        if (privacyCheckbox) {
            privacyCheckbox.addEventListener("change", validateContactForm);
        }
    }

    // 초기 폼 유효성 검사
    validateContactForm();
});

// FAQ 데이터 로드
async function loadFAQData() {
    const faqList = document.getElementById("faqList");

    try {
        // 로딩 상태 표시
        faqList.innerHTML =
            '<div class="loading">FAQ 데이터를 불러오는 중입니다...</div>';

        const response = await fetch(
            "https://before-cafe24.vercel.app/api/apogee/faq"
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            displayFAQItems(result.data);
        } else {
            throw new Error("FAQ 데이터 형식이 올바르지 않습니다.");
        }
    } catch (error) {
        console.error("FAQ 데이터 로드 실패:", error);
        faqList.innerHTML = `
            <div class="error">
                FAQ 데이터를 불러오는데 실패했습니다.<br>
                잠시 후 다시 시도해주세요.
            </div>
        `;
    }
}

// FAQ 항목 표시
function displayFAQItems(faqData) {
    const faqList = document.getElementById("faqList");

    // order 순으로 정렬
    const sortedFAQs = faqData
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);

    if (sortedFAQs.length === 0) {
        faqList.innerHTML = '<div class="error">등록된 FAQ가 없습니다.</div>';
        return;
    }

    const faqHTML = sortedFAQs
        .map(
            (item) => `
        <div class="bw-faq-item" data-id="${item.id}">
            <button class="faq-question" onclick="toggleFAQ('${item.id}')">
                <span>Q. ${item.question}</span>
                <div class="faq-toggle">
                    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect y="1.14697" width="1.82931" height="14.8462" rx="0.914656" transform="rotate(-38.8276 0 1.14697)" fill="#37000A"/>
                        <rect x="17.5752" width="1.82931" height="14.8462" rx="0.914656" transform="rotate(38.83 17.5752 0)" fill="#37000A"/>
                    </svg>
                </div>
            </button>
            <div class="faq-answer" id="answer-${item.id}">
                <div class="faq-answer-content">${item.answer}</div>
            </div>
        </div>
    `
        )
        .join("");

    faqList.innerHTML = faqHTML;
}

// FAQ 토글 기능
function toggleFAQ(faqId) {
    const questionBtn = document.querySelector(
        `[data-id="${faqId}"] .faq-question`
    );
    const answerDiv = document.getElementById(`answer-${faqId}`);

    if (!questionBtn || !answerDiv) return;

    const isActive = questionBtn.classList.contains("active");

    // 다른 모든 FAQ 닫기
    document.querySelectorAll(".faq-question.active").forEach((btn) => {
        btn.classList.remove("active");
    });
    document.querySelectorAll(".faq-answer.active").forEach((answer) => {
        answer.classList.remove("active");
    });

    // 현재 FAQ 토글
    if (!isActive) {
        questionBtn.classList.add("active");
        answerDiv.classList.add("active");

        // 부드러운 스크롤
        setTimeout(() => {
            questionBtn.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 100);
    }
}

// 카카오톡 채널 열기
function openKakaoChannel() {
    // 카카오톡 채널 URL (실제 채널 URL로 교체 필요)
    window.open("http://pf.kakao.com/_iJxaxgG/chat", "_blank");
}

// 모달 이벤트 초기화
function initializeModalEvents() {
    // 모달 외부 클릭 시 닫기
    document.addEventListener("click", function (e) {
        const contactModal = document.getElementById("contactModal");
        const privacyModal = document.getElementById("privacyModal");
        const modalPanel = document.querySelector(".modal-panel");
        const privacyModalPanel = document.querySelector(
            ".privacy-modal-panel"
        );

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
                (e.target === privacyModal &&
                    !privacyModalPanel.contains(e.target))
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
}

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
        // 버튼 상태 초기화
        validateContactForm();
    }
}

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

// 개인/기업 선택 함수
function selectContactType(type) {
    // 모든 버튼의 active 클래스 제거
    document.querySelectorAll(".contact-type-btn").forEach((btn) => {
        btn.classList.remove("active");
    });

    // 선택된 버튼에 active 클래스 추가
    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add("active");
    }

    // 라벨과 플레이스홀더 변경
    const nameLabel = document.getElementById("nameLabel");
    const nameInput = document.getElementById("name");

    if (nameLabel && nameInput) {
        if (type === "개인") {
            nameLabel.textContent = "성함";
            nameInput.placeholder = "성함을 입력하세요";
        } else {
            nameLabel.textContent = "기업명";
            nameInput.placeholder = "기업명을 입력하세요";
        }
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

    // 버튼 활성화/비활성화 (index.js와 동일한 방식)
    if (isFormValid) {
        submitBtn.classList.add("active");
    } else {
        submitBtn.classList.remove("active");
    }
}
