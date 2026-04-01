document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ Replace with your real API key or move this to Firebase Functions for production
    const API_KEY = 'AIzaSyCwrKyohKfjfvz8NjPK3P5QIqDquhtfnqI';
    const MODEL = 'gemini-2.5-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-btn');
    const solveBtn = document.getElementById('solve-btn');
    const resultsSection = document.getElementById('results-section');
    const loader = document.getElementById('loader');
    const solutionContent = document.getElementById('solution-content');
    const resetBtn = document.getElementById('reset-btn');
    const questionInput = document.getElementById('question-input');

    let currentFile = null;
    let base64Image = null;

    function checkInputs() {
        const hasImage = !!base64Image;
        const hasText = questionInput.value.trim().length > 0;
        const hasInput = hasImage || hasText;

        solveBtn.classList.toggle('hidden', !hasInput);
        solveBtn.disabled = !hasInput;
    }

    // Open file picker
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        currentFile = file;
        const reader = new FileReader();

        reader.onload = (event) => {
            const dataUrl = event.target.result;
            imagePreview.src = dataUrl;
            base64Image = dataUrl.split(',')[1];
            showPreview();
        };

        reader.readAsDataURL(file);
    }

    function showPreview() {
        dropZone.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        checkInputs();
    }

    function removePreview() {
        currentFile = null;
        base64Image = null;
        fileInput.value = '';
        questionInput.value = '';

        previewContainer.classList.add('hidden');
        dropZone.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        checkInputs();
    }

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removePreview();
    });

    resetBtn.addEventListener('click', removePreview);
    questionInput.addEventListener('input', checkInputs);

    solveBtn.addEventListener('click', async () => {
        const questionText = questionInput.value.trim();
        if (!base64Image && !questionText) return;

        solveBtn.disabled = true;
        solveBtn.innerHTML = '<span class="btn-text">Getting Help...</span>';

        resultsSection.classList.remove('hidden');
        loader.classList.remove('hidden');
        solutionContent.innerHTML = '';
        solutionContent.classList.add('hidden');
        resetBtn.classList.add('hidden');

        try {
            let parts = [];

            const prompt = `Analyze the given input carefully.\n\n- If it is a math problem, explain the solution step-by-step clearly.\n- Show formulas in proper LaTeX format.\n- Do not reveal only the final answer directly unless specifically asked.\n- If it is another subject, provide a clean and accurate answer in markdown.\n- Keep the response well formatted.`;

            if (base64Image) {
                parts.push({ text: prompt });
                parts.push({
                    inlineData: {
                        mimeType: currentFile?.type || 'image/jpeg',
                        data: base64Image
                    }
                });
            }

            if (questionText) {
                parts.push({ text: `${prompt}\n\nQuestion: ${questionText}` });
            }

            const payload = {
                contents: [{ parts }]
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to fetch AI response');
            }

            const markdownText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!markdownText) {
                throw new Error('Invalid AI response format');
            }

            // Markdown rendering
            const htmlContent = typeof marked !== 'undefined'
                ? marked.parse(markdownText)
                : markdownText;

            solutionContent.innerHTML = htmlContent;

            // KaTeX math rendering
            const renderMath = () => {
                if (typeof renderMathInElement !== 'undefined') {
                    renderMathInElement(solutionContent, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false },
                            { left: '\\(', right: '\\)', display: false },
                            { left: '\\[', right: '\\]', display: true }
                        ]
                    });
                }
            };

            renderMath();
            solutionContent.classList.remove('hidden');
        } catch (error) {
            console.error('Gemini Error:', error);
            solutionContent.innerHTML = `
                <div class="error-state">
                    <h3 style="color:red;">Error solving problem</h3>
                    <p>${error.message}</p>
                </div>
            `;
            solutionContent.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
            solveBtn.innerHTML = '<span class="btn-text">Get Help</span><span class="btn-icon">✨</span>';
            solveBtn.disabled = false;
            resetBtn.classList.remove('hidden');
        }
    });

    checkInputs();
});
