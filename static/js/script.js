// ===============================
// FILE NAME PREVIEW
// ===============================

const videoInput = document.getElementById("videoInput");
const fileName = document.getElementById("file-name");

if (videoInput) {

    videoInput.addEventListener("change", function () {

        if (this.files.length > 0) {

            fileName.innerHTML = "📹 " + this.files[0].name;

        } else {

            fileName.innerHTML = "No file selected";

        }

    });

}


// ===============================
// DARK MODE
// ===============================

const themeBtn = document.getElementById("theme-toggle");

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

    } else {

        localStorage.setItem("theme", "light");

        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';

    }

});


// ===============================
// COPY BUTTONS
// ===============================

const copyButtons = document.querySelectorAll(".btn-copy");

copyButtons.forEach(button => {

    button.addEventListener("click", () => {

        const target = document.querySelector(button.dataset.target);

        if (!target) return;

        navigator.clipboard.writeText(target.innerText);

        button.innerHTML = '<i class="fa-solid fa-check"></i>';

        setTimeout(() => {

            button.innerHTML = '<i class="fa-regular fa-copy"></i>';

        }, 1500);

    });

});


// ===============================
// PROGRESS BAR DEMO
// ===============================

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

if (progressBar) {

    let progress = 0;

    const interval = setInterval(() => {

        progress += 5;

        progressBar.style.width = progress + "%";

        progressText.innerHTML = progress + "%";

        if (progress >= 100) {

            clearInterval(interval);

            progressText.innerHTML = "Completed";

        }

    }, 120);

}

// ===============================
// SHOW LOADING OVERLAY
// ===============================

const uploadForm = document.querySelector('form[action="/upload"]');
const askForm = document.querySelector('form[action="/ask"]');

if (uploadForm) {

    uploadForm.addEventListener("submit", function (e) {

        const videoInput = document.getElementById("videoInput");
        const videoUrl = document.getElementById("videoUrl");

        const hasFile = videoInput.files.length > 0;
        const hasLink = videoUrl && videoUrl.value.trim() !== "";

        if (!hasFile && !hasLink) {

            e.preventDefault();

            Swal.fire({
                icon: "warning",
                title: "No Video Selected",
                text: "Please select a video or paste a video link."
            });

            return;
        }

        // Stop old video while new video is processing
        const oldVideo = document.getElementById("videoPlayer");

        if (oldVideo) {
            oldVideo.pause();
            oldVideo.removeAttribute("src");

            const source = oldVideo.querySelector("source");
            if (source) {
                source.removeAttribute("src");
            }

            oldVideo.load();
        }

        document.getElementById("loading-overlay").style.display = "flex";

    });

}

/*if (askForm) {

    askForm.addEventListener("submit", function () {

        document.getElementById("loading-overlay").style.display = "flex";

    });

}*/

// ===============================
// ASK AI WITHOUT PAGE REFRESH
// ===============================

const askAIForm = document.getElementById("askForm");

if (askAIForm) {

    askAIForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const questionInput = document.getElementById("questionInput");
        const answerBox = document.getElementById("answerBox");
        const historyList = document.getElementById("historyList");

        // =================================
        // CHECK VIDEO FIRST
        // =================================

        const videoPlayer = document.getElementById("videoPlayer");

        if (!videoPlayer) {

            Swal.fire({
                icon: "warning",
                title: "No Video Uploaded",
                text: "Please upload a video before asking AI.",
                confirmButtonText: "OK",
                confirmButtonColor: "#6C63FF"
            });

            return;
        }

        // =================================
        // CHECK QUESTION
        // =================================

        if (questionInput.value.trim() === "") {

            questionInput.setAttribute("required", "required");

            questionInput.reportValidity();

            return;
        }

        // Remove required after valid question
        questionInput.removeAttribute("required");

        const formData = new FormData(this);

        // =================================
        // NOW SHOW THINKING
        // =================================

        answerBox.innerHTML = `
            <h6>
                <i class="fa-solid fa-spinner fa-spin me-2"></i>
                AI is thinking...
            </h6>
        `;

        try {

            const response = await fetch("/ask", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!data.success) {

                Swal.fire({
                    icon: "warning",
                    title: "No Video Uploaded",
                    text: "Please upload a video before asking AI.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#6C63FF"
                });

                answerBox.innerHTML = "";

                return;
            }

            // =================================
            // ADD QUESTION TO HISTORY
            // =================================

            if (historyList) {

                const noQuestion = historyList.querySelector("p");

                if (noQuestion) {
                    noQuestion.remove();
                }

                historyList.insertAdjacentHTML(
                    "afterbegin",
                    `
                    <div class="history-item mb-4">

                        <h6 class="text-primary">

                            <i class="fa-solid fa-circle-question me-2"></i>

                            ${formData.get("question")}

                        </h6>

                        <pre>${data.answer}</pre>

                    </div>

                    <hr>
                    `
                );
            }

            // =================================
            // SHOW ANSWER
            // =================================

            answerBox.innerHTML = `
                <h6>
                    <i class="fa-solid fa-wand-magic-sparkles me-2"></i>
                    AI Answer
                </h6>

                <hr>

                <p class="fw-bold text-primary">

                    <i class="fa-solid fa-circle-question me-2"></i>

                    ${formData.get("question")}

                </p>

                <pre>${data.answer}</pre>
            `;

            questionInput.value = "";

            if (clearQuestion) {
                clearQuestion.style.display = "none";
            }

        } catch (error) {

            console.error("Ask AI error:", error);

            answerBox.innerHTML = "";

            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Unable to get the AI answer. Please try again.",
                confirmButtonText: "OK",
                confirmButtonColor: "#6C63FF"
            });

        }

    });

}

// ===============================
// DOWNLOAD QA PDF
// ===============================
const downloadBtn = document.getElementById("downloadQAPdf");

if (downloadBtn) {

    downloadBtn.addEventListener("click", async function () {

        const response = await fetch("/download_qa_pdf");

        const data = await response.json();

        if (!data.success) {

            Swal.fire({
                icon: "warning",
                title: "No Questions Asked",
                html: "<b>Please ask at least one question</b><br>before downloading the PDF.",
                confirmButtonText: "Got it!",
                confirmButtonColor: "#6C63FF",
                background: "#1f2937",
                color: "#ffffff",
                backdrop: "rgba(0,0,0,0.6)",
                showClass: {
                    popup: "animate__animated animate__zoomIn"
                },
                hideClass: {
                    popup: "animate__animated animate__zoomOut"
                }
            });

            return;
        }

        window.location.href = data.url;

    });

}

// ===============================
// CLEAR TRANSCRIPT SEARCH
// ===============================

const transcriptSearch = document.getElementById("transcriptSearch");
const clearTranscriptSearch = document.getElementById("clearTranscriptSearch");

if (transcriptSearch && clearTranscriptSearch) {

    transcriptSearch.addEventListener("input", function () {

        if (this.value.length > 0) {
            clearTranscriptSearch.style.display = "block";
        } else {
            clearTranscriptSearch.style.display = "none";
        }

    });

    clearTranscriptSearch.addEventListener("click", function () {

        transcriptSearch.value = "";

        transcriptSearch.focus();

        this.style.display = "none";

    });

}

// ===============================
// CLEAR ASK AI QUESTION
// ===============================

const questionInput = document.getElementById("questionInput");
const clearQuestion = document.getElementById("clearQuestion");

if (questionInput && clearQuestion) {

    questionInput.addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearQuestion.style.display = "block";

        } else {

            clearQuestion.style.display = "none";

        }

    });

    clearQuestion.addEventListener("click", function () {

        questionInput.value = "";

        clearQuestion.style.display = "none";

        questionInput.focus();

    });

}

// ===============================
// TRANSCRIPT SEARCH
// ===============================

const transcriptElement = document.getElementById("transcript-text");

if (transcriptSearch && transcriptElement) {

    const originalTranscript = transcriptElement.innerText;

    transcriptSearch.addEventListener("input", function () {

        const searchText = this.value.toLowerCase().trim();

        if (searchText === "") {

            transcriptElement.innerText = originalTranscript;

            return;
        }

        const lines = originalTranscript.split("\n");

        const matchingLines = lines.filter(line =>
            line.toLowerCase().includes(searchText)
        );

        if (matchingLines.length > 0) {

            transcriptElement.innerText =
                matchingLines.join("\n");

        } else {

            transcriptElement.innerText =
                "No matching text found.";

        }

    });

}

// ===============================
// CHANGE OUTPUT LANGUAGE
// ===============================

const changeLanguage = document.getElementById("changeLanguage");

if (changeLanguage) {

    changeLanguage.addEventListener("change", async function () {

        const language = this.value;

        const formData = new FormData();

        formData.append("language", language);

        try {

            const response = await fetch("/change_language", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (!data.success) {

                Swal.fire({
                    icon: "warning",
                    title: "No Video Uploaded",
                    text: "Please upload a video first before asking AI.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#6C63FF"
                });

                return;
            }

            if (!data.success) {
                alert(data.message);
                return;
            }

            // Update Transcript
            const transcriptElement =
                document.getElementById("transcript-text");

            if (transcriptElement) {
                transcriptElement.innerText = data.transcript;
            }

            // Update Summary
            const summaryElement =
                document.getElementById("summary-text");

            if (summaryElement) {
                summaryElement.innerText = data.summary;
            }

            // Update Notes
            const notesElement =
                document.getElementById("notes-text");

            if (notesElement) {
                notesElement.innerText = data.notes;
            }

            // Update Chapters
            const chapterList = document.querySelector(".chapter-list");

            if (chapterList && Array.isArray(data.chapters)) {

                data.chapters.forEach((chapter, index) => {

                    const item = chapterList.children[index];

                    if (item) {

                        const title = item.querySelector(".chapter-title");

                        if (title) {
                            title.textContent = chapter.text;
                        }

                    }

                });

            }
        } catch (error) {

            console.error("Language change error:", error);

            alert("Unable to change language. Please try again.");

        }

    });

}

// ===============================
// PAGE LANGUAGE TRANSLATIONS
// ===============================

const translations = {

    english: {
        askAI: "Ask AI",
        transcript: "Transcript",
        aiSummary: "AI Summary",
        smartNotes: "Smart Notes",
        videoChapters: "Video Chapters",
        uploadVideo: "Upload Video",
        uploadedVideo: "Uploaded Video",
        previousQuestions: "Previous Questions",
        pdf: "PDF",

        dragDropVideo: "Drag & Drop Video",
        browseComputer: "Click here to browse your computer",
        noFileSelected: "No file selected",

        noVideoUploaded: "No Video Uploaded Yet",
        uploadVideoMessage: "Upload a video to start AI processing.",
        chaptersMessage: "Chapters will appear after uploading a video.",

        searchTranscript: "🔍 Search transcript...",
        askDescription: "Ask anything related to the uploaded video",
        questionPlaceholder: "Example: What is the main topic of this video?",

        noTranscript: "No transcript available.",
        noSummary: "No summary generated.",
        noNotes: "No notes available.",
        noQuestions: "No questions asked yet.",
    },

    hindi: {
        askAI: "एआई से पूछें",
        transcript: "प्रतिलिपि",
        aiSummary: "एआई सारांश",
        smartNotes: "स्मार्ट नोट्स",
        videoChapters: "वीडियो अध्याय",
        uploadVideo: "वीडियो अपलोड करें",
        uploadedVideo: "अपलोड किया गया वीडियो",
        previousQuestions: "पिछले प्रश्न",
        pdf: "पीडीएफ",

        dragDropVideo: "वीडियो को यहाँ खींचें और छोड़ें",
        browseComputer: "कंप्यूटर से वीडियो चुनने के लिए यहाँ क्लिक करें",
        noFileSelected: "कोई फ़ाइल चयनित नहीं है",

        noVideoUploaded: "अभी कोई वीडियो अपलोड नहीं किया गया",
        uploadVideoMessage: "एआई प्रोसेसिंग शुरू करने के लिए वीडियो अपलोड करें।",
        chaptersMessage: "वीडियो अपलोड करने के बाद अध्याय दिखाई देंगे।",

        searchTranscript: "🔍 प्रतिलिपि खोजें...",
        askDescription: "अपलोड किए गए वीडियो से संबंधित कुछ भी पूछें",
        questionPlaceholder: "उदाहरण: इस वीडियो का मुख्य विषय क्या है?",

        noTranscript: "कोई प्रतिलिपि उपलब्ध नहीं है।",
        noSummary: "कोई सारांश उपलब्ध नहीं है।",
        noNotes: "कोई नोट्स उपलब्ध नहीं हैं।",
        noQuestions: "अभी तक कोई प्रश्न नहीं पूछा गया है।"
    },

    hinglish: {
        askAI: "AI Se Puchhein",
        transcript: "Transcript",
        aiSummary: "AI Summary",
        smartNotes: "Smart Notes",
        videoChapters: "Video Chapters",
        uploadVideo: "Video Upload Karein",
        uploadedVideo: "Uploaded Video",
        previousQuestions: "Previous Questions",
        pdf: "PDF",

        dragDropVideo: "Video ko yahan Drag & Drop karein",
        browseComputer: "Computer se video select karne ke liye yahan click karein",
        noFileSelected: "Koi file select nahi hai",

        noVideoUploaded: "Abhi koi video upload nahi hua",
        uploadVideoMessage: "AI processing start karne ke liye video upload karein.",
        chaptersMessage: "Video upload karne ke baad chapters yahan dikhenge.",

        searchTranscript: "🔍 Transcript search karein...",
        askDescription: "Uploaded video se related kuch bhi poochhein",
        questionPlaceholder: "Example: Is video ka main topic kya hai?",

        noTranscript: "Koi transcript available nahi hai.",
        noSummary: "Koi summary generate nahi hui.",
        noNotes: "Koi notes available nahi hain.",
        noQuestions: "Abhi tak koi question nahi poocha gaya hai."
    }

};

// ===============================
// APPLY PAGE LANGUAGE
// ===============================
function applyLanguage(language) {

    const texts = translations[language];

    if (!texts) return;

    document.querySelectorAll("[data-i18n]").forEach(element => {

        const key = element.getAttribute("data-i18n");

        if (!texts[key]) return;

        const icon = element.querySelector("i");

        if (icon) {

            // Remove old text nodes but keep icon
            Array.from(element.childNodes).forEach(node => {

                if (node.nodeType === Node.TEXT_NODE) {
                    node.remove();
                }

            });

            icon.insertAdjacentText("afterend", " " + texts[key]);

        } else {

            element.textContent = texts[key];

        }

    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {

        const key = element.getAttribute("data-i18n-placeholder");

        if (texts[key]) {
            element.placeholder = texts[key];
        }

    });

}
// ===============================
// LANGUAGE DROPDOWN
// ===============================

const languageSelector = document.getElementById("changeLanguage");

if (languageSelector) {

    languageSelector.addEventListener("change", function () {

        const selectedLanguage = this.value;

        localStorage.setItem("selectedLanguage", selectedLanguage);

        applyLanguage(selectedLanguage);

    });

}


// ===============================
// APPLY SAVED LANGUAGE
// ===============================

const savedLanguage =
    localStorage.getItem("selectedLanguage") || "english";

if (languageSelector) {

    languageSelector.value = savedLanguage;

    applyLanguage(savedLanguage);

}

// ===============================
// UPLOAD ANOTHER VIDEO
// CLEAR EVERYTHING FROM PREVIOUS VIDEO
// ===============================

const uploadAnotherBtn = document.getElementById("uploadAnotherBtn");
const uploadSection = document.getElementById("uploadSection");
const uploadedVideoSection = document.getElementById("uploadedVideoSection");

if (uploadAnotherBtn) {

    uploadAnotherBtn.addEventListener("click", function () {

        // ===============================
        // 1. STOP VIDEO COMPLETELY
        // ===============================

        const videoPlayer = document.getElementById("videoPlayer");

        if (videoPlayer) {
            videoPlayer.pause();

            videoPlayer.currentTime = 0;

            videoPlayer.removeAttribute("src");

            const source = videoPlayer.querySelector("source");

            if (source) {
                source.removeAttribute("src");
            }

            videoPlayer.load();
        }


        // ===============================
        // 2. STOP ANY OTHER AUDIO
        // ===============================

        document.querySelectorAll("audio").forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
            audio.removeAttribute("src");
            audio.load();
        });


        // ===============================
        // 3. CLEAR OLD VIDEO SECTION
        // ===============================

        if (uploadedVideoSection) {
            uploadedVideoSection.style.display = "none";
        }


        // ===============================
        // 4. CLEAR TRANSCRIPT
        // ===============================

        const transcript = document.getElementById("transcript-text");

        if (transcript) {
            transcript.innerText = "";
        }


        // ===============================
        // 5. CLEAR SUMMARY
        // ===============================

        const summary = document.getElementById("summary-text");

        if (summary) {
            summary.innerText = "";
        }


        // ===============================
        // 6. CLEAR SMART NOTES
        // ===============================

        const notes = document.getElementById("notes-text");

        if (notes) {
            notes.innerText = "";
        }


        // ===============================
        // 7. CLEAR AI ANSWER
        // ===============================

        const answerBox = document.getElementById("answerBox");

        if (answerBox) {
            answerBox.innerHTML = "";
        }


        // ===============================
        // 8. CLEAR PREVIOUS QUESTIONS
        // ===============================

        const historyList = document.getElementById("historyList");

        if (historyList) {
            historyList.innerHTML = `
                <p class="mb-0" data-i18n="noQuestions">
                    No questions asked yet.
                </p>
            `;
        }


        // ===============================
        // 9. CLEAR VIDEO CHAPTERS
        // ===============================

        const chapterList = document.querySelector(".chapter-list");

        if (chapterList) {
            chapterList.innerHTML = "";
        }


        // ===============================
        // 10. CLEAR SEARCH
        // ===============================

        const transcriptSearch =
            document.getElementById("transcriptSearch");

        if (transcriptSearch) {
            transcriptSearch.value = "";
        }


        // ===============================
        // 11. CLEAR QUESTION INPUT
        // ===============================

        const questionInput =
            document.getElementById("questionInput");

        if (questionInput) {
            questionInput.value = "";
        }


        // ===============================
        // 12. RESET FILE INPUT
        // ===============================

        if (videoInput) {
            videoInput.value = "";
        }

        if (fileName) {
            fileName.innerHTML = "No file selected";
        }


        // ===============================
        // 13. SHOW NEW UPLOAD SECTION
        // ===============================

        if (uploadSection) {
            uploadSection.style.display = "block";
        }


        // ===============================
        // 14. SCROLL TO UPLOAD AREA
        // ===============================

        if (uploadSection) {
            uploadSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

    });

}

// ===============================
// SMART NOTES CARD
// ===============================

const smartNotesCard = document.getElementById("smartNotesCard");

if (smartNotesCard) {

    smartNotesCard.addEventListener("click", function () {

        const notesText = document.getElementById("notes-text");

        // No notes means no video uploaded
        if (!notesText || notesText.innerText.trim() === "") {

            Swal.fire({
                icon: "warning",
                title: "No Video Uploaded",
                text: "Please upload a video first.",
                confirmButtonText: "Upload Video",
                confirmButtonColor: "#6C63FF"
            }).then((result) => {

                if (result.isConfirmed) {

                    const uploadSection =
                        document.getElementById("uploadSection");

                    if (uploadSection) {

                        uploadSection.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }

                }

            });

            return;
        }

        // Video exists → scroll to Smart Notes
        const smartNotesSection =
            document.getElementById("smartNotesSection");

        if (smartNotesSection) {

            smartNotesSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

}


// ===============================
// PDF DOWNLOAD CHECK
// ===============================

document.querySelectorAll(".pdf-download-btn").forEach(button => {

    button.addEventListener("click", async function (e) {

        e.preventDefault();

        try {

            const response = await fetch("/download_pdf");

            if (!response.ok) {

                Swal.fire({
                    icon: "warning",
                    title: "No Video Uploaded",
                    text: "Please upload a video before downloading the PDF.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#6C63FF"
                });

                return;
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "AI_Video_Report.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error("PDF ERROR:", error);

            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Unable to download PDF."
            });

        }

    });

});

// ===============================
// COLLAPSE / EXPAND CONTENT
// ===============================

document.querySelectorAll(".collapse-btn").forEach(button => {

    button.addEventListener("click", function () {

        const card = this.closest(".glass-card");
        const content = card.querySelector(".collapsible-content");

        if (!content) return;

        if (content.style.display === "none") {

            content.style.display = "";

            this.classList.remove("collapsed");

        } else {

            content.style.display = "none";

            this.classList.add("collapsed");

        }

    });

});