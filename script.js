(function () {
    'use strict';

    const API_KEY = 'AQ.Ab8RN6KPDEXhTVYfdZflw9JTPC-CPi-8v5AnVrok_iWZIckzkg';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const MAX_QUESTIONS = 5;
    const STORAGE_CHAT = 'sharks_ai_chat_v2';
    const STORAGE_PROFILE = 'sharks_ai_profile_v2';
    const STORAGE_COUNTER = 'sharks_ai_counter_v2';

    const SUGGESTIONS = [
        { icon: 'fa-dumbbell', text: 'اعمل لي برنامج تمرين للمبتدئين' },
        { icon: 'fa-fire', text: 'كام سعرة أحتاج في اليوم لخسارة الوزن؟' },
        { icon: 'fa-heart-pulse', text: 'إيه الفرق بين الكارديو والحديد؟' },
        { icon: 'fa-shield-halved', text: 'أفضل تمارين لبناء عضلات الصدر' },
        { icon: 'fa-location-dot', text: 'إزاي أختار الجيم المناسب ليا؟' }
    ];

    const els = {
        messages: document.getElementById('chat-messages'),
        welcome: document.getElementById('welcome-screen'),
        suggestionsContainer: document.getElementById('suggestions-container'),
        input: document.getElementById('message-input'),
        sendBtn: document.getElementById('send-btn'),
        chip: document.getElementById('questions-chip'),
        chipText: document.getElementById('questions-chip-text'),
        timer: document.getElementById('reset-timer'),
        profileCard: document.getElementById('profile-card'),
        profileAvatar: document.getElementById('profile-avatar'),
        profileName: document.getElementById('profile-name'),
        profileStatus: document.getElementById('profile-status'),
        statRemaining: document.getElementById('stat-remaining'),
        statMessages: document.getElementById('stat-messages'),
        settingsModal: document.getElementById('settings-modal'),
        profileForm: document.getElementById('profile-form'),
        sidebar: document.getElementById('sidebar'),
        scrollBottomBtn: document.getElementById('scroll-bottom-btn')
    };

    let chatHistory = [];
    let userProfile = {};
    let questionCount = 0;
    let currentCycleId = '';
    let isTyping = false;
    let autoScroll = true;
    let timerInterval = null;

    function getCycleId() {
        const now = new Date();
        const shifted = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
    }

    function getTimeUntilReset() {
        const now = new Date();
        const next = new Date(now);
        next.setUTCHours(6, 0, 0, 0);
        if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
        const diff = next - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateTimerUI() {
        if (!els.timer) return;
        els.timer.textContent = getTimeUntilReset();
    }

    function startTimer() {
        updateTimerUI();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const newCycle = getCycleId();
            if (newCycle !== currentCycleId) {
                currentCycleId = newCycle;
                questionCount = 0;
                saveCounter();
                updateCounterUI();
                showToast('تم تجديد أسئلتك اليومية', 'success');
            }
            updateTimerUI();
        }, 1000);
    }

    function saveChat() {
        try {
            localStorage.setItem(STORAGE_CHAT, JSON.stringify(chatHistory.slice(-100)));
        } catch (e) { }
    }

    function loadChat() {
        try {
            const d = localStorage.getItem(STORAGE_CHAT);
            return d ? JSON.parse(d) : [];
        } catch (e) { return []; }
    }

    function saveProfile() {
        try {
            localStorage.setItem(STORAGE_PROFILE, JSON.stringify(userProfile));
        } catch (e) { }
    }

    function loadProfile() {
        try {
            const d = localStorage.getItem(STORAGE_PROFILE);
            return d ? JSON.parse(d) : {};
        } catch (e) { return {}; }
    }

    function saveCounter() {
        try {
            localStorage.setItem(STORAGE_COUNTER, JSON.stringify({ cycleId: currentCycleId, count: questionCount }));
        } catch (e) { }
    }

    function loadCounter() {
        try {
            const d = localStorage.getItem(STORAGE_COUNTER);
            if (!d) return;
            const p = JSON.parse(d);
            if (p.cycleId === currentCycleId) {
                questionCount = p.count || 0;
            } else {
                questionCount = 0;
                saveCounter();
            }
        } catch (e) {
            questionCount = 0;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function parseMarkdown(text) {
        if (typeof marked === 'undefined') return escapeHtml(text).replace(/\n/g, '<br>');
        try {
            marked.setOptions({ breaks: true, gfm: true, headerIds: false, mangle: false });
            return marked.parse(text);
        } catch (e) {
            return escapeHtml(text).replace(/\n/g, '<br>');
        }
    }

    function formatTime(ts) {
        const d = ts ? new Date(ts) : new Date();
        return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    function updateCounterUI() {
        const remaining = Math.max(0, MAX_QUESTIONS - questionCount);
        if (els.chipText) els.chipText.textContent = `${remaining} / ${MAX_QUESTIONS}`;
        if (els.statRemaining) els.statRemaining.textContent = remaining;

        if (els.chip) {
            els.chip.classList.remove('warning', 'danger');
            if (remaining === 0) els.chip.classList.add('danger');
            else if (remaining <= 2) els.chip.classList.add('warning');
        }

        if (els.statRemaining) {
            els.statRemaining.classList.remove('warn', 'danger');
            if (remaining === 0) els.statRemaining.classList.add('danger');
            else if (remaining <= 2) els.statRemaining.classList.add('warn');
        }

        if (els.sendBtn) els.sendBtn.disabled = remaining === 0 || isTyping;

        if (els.input) {
            els.input.disabled = remaining === 0;
            els.input.placeholder = remaining === 0
                ? 'انتهت أسئلتك اليومية. عد بعد 6 صباحاً GMT'
                : 'اكتب سؤالك هنا...';
        }
    }

    function updateProfileUI() {
        if (!els.profileAvatar || !els.profileName) return;
        const name = userProfile.name || 'مستخدم جديد';
        els.profileAvatar.textContent = (name.charAt(0) || 'U').toUpperCase();
        els.profileName.textContent = name;

        const parts = [];
        if (userProfile.age) parts.push(userProfile.age + ' سنة');
        if (userProfile.weight) parts.push(userProfile.weight + ' كجم');
        if (userProfile.goal) parts.push(userProfile.goal);
        els.profileStatus.textContent = parts.length ? parts.join(' • ') : 'اضغط لإكمال بياناتك';

        if (els.statMessages) els.statMessages.textContent = chatHistory.filter(m => m.role === 'user').length;
    }

    function renderSuggestions() {
        if (!els.suggestionsContainer) return;
        els.suggestionsContainer.innerHTML = SUGGESTIONS.map(s =>
            `<button class="suggestion-card" data-prompt="${escapeHtml(s.text)}"><i class="fa-solid ${s.icon}"></i><span>${escapeHtml(s.text)}</span></button>`
        ).join('');

        els.suggestionsContainer.querySelectorAll('.suggestion-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = btn.getAttribute('data-prompt');
                if (els.input) {
                    els.input.value = p;
                    els.input.focus();
                    autoResize();
                }
            });
        });
    }

    function createMessageBubble(role, content, ts) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.innerHTML = `<div class="message-avatar"><i class="fa-solid ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i></div><div class="message-body"><div class="message-content">${content}</div><div class="message-time">${formatTime(ts)}</div></div>`;
        return div;
    }

    function hideWelcome() {
        if (els.welcome && els.welcome.parentNode) {
            els.welcome.remove();
            els.welcome = null;
        }
    }

    function renderMessage(role, text, ts) {
        hideWelcome();
        const bubble = createMessageBubble(
            role,
            role === 'user' ? escapeHtml(text).replace(/\n/g, '<br>') : parseMarkdown(text),
            ts
        );
        els.messages.appendChild(bubble);
        scrollToBottom(true);
        return bubble;
    }

    function renderTypingMessage(role, text, ts) {
        return new Promise(resolve => {
            hideWelcome();
            const bubble = createMessageBubble(role, '', ts);
            els.messages.appendChild(bubble);
            const contentEl = bubble.querySelector('.message-content');
            let i = 0;
            const chunk = Math.max(1, Math.floor(text.length / 150));
            const speed = 8;

            function step() {
                if (i < text.length) {
                    i = Math.min(i + chunk, text.length);
                    contentEl.textContent = text.substring(0, i);
                    if (autoScroll) els.messages.scrollTop = els.messages.scrollHeight;
                    setTimeout(step, speed);
                } else {
                    contentEl.innerHTML = parseMarkdown(text);
                    scrollToBottom(true);
                    resolve();
                }
            }
            step();
        });
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typing-indicator';
        div.innerHTML = `<div class="message-avatar" style="background:var(--bg-elevated);color:var(--primary-blue);border:1px solid var(--border-color);width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;"><i class="fa-solid fa-robot"></i></div><div class="typing-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
        els.messages.appendChild(div);
        scrollToBottom(true);
        return div;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function scrollToBottom(force) {
        if (!autoScroll && !force) return;
        requestAnimationFrame(() => {
            els.messages.scrollTop = els.messages.scrollHeight;
        });
    }

    function autoResize() {
        if (!els.input) return;
        els.input.style.height = 'auto';
        els.input.style.height = Math.min(els.input.scrollHeight, 150) + 'px';
    }

    function buildSystemPrompt() {
        let prompt = `أنت SHARKS AI، المساعد الذكي الرسمي لمنصة SHARKS لاكتشاف الجيمات في مصر.

مهمتك مساعدة المستخدمين في كل ما يخص:
- التمارين الرياضية وبرامج التدريب
- التغذية وحساب السعرات والماكروز
- إنقاص الوزن وبناء العضلات
- اختيار الجيم المناسب
- الإجابة على أي سؤال رياضي أو صحي

قواعد مهمة:
- تحدث بالعربية المصرية الودودة
- كن مختصراً وواضحاً ومباشراً
- استخدم تنسيق Markdown (عناوين، قوائم، **عريض**، كود) لتنظيم الردود
- كن متحفظاً في النصائح الطبية وانصح بمراجعة متخصص عند الحاجة
- لا تكرر نفس السؤال أو المعلومات
- لا تذكر أنك Gemini أو أي نموذج آخر، أنت SHARKS AI فقط
- لا تستخدم الإيموجي في ردودك أبداً`;

        if (userProfile.name) prompt += `\n\nمعلومات المستخدم:\n- الاسم: ${userProfile.name}`;
        if (userProfile.age) prompt += `\n- العمر: ${userProfile.age} سنة`;
        if (userProfile.gender) prompt += `\n- الجنس: ${userProfile.gender === 'male' ? 'ذكر' : 'أنثى'}`;
        if (userProfile.height) prompt += `\n- الطول: ${userProfile.height} سم`;
        if (userProfile.weight) prompt += `\n- الوزن: ${userProfile.weight} كجم`;
        if (userProfile.goal) prompt += `\n- الهدف: ${userProfile.goal}`;
        if (userProfile.activity) prompt += `\n- مستوى النشاط: ${userProfile.activity}`;

        if (questionCount >= MAX_QUESTIONS) {
            prompt += `\n\nتنبيه حرج: هذا آخر سؤال للمستخدم اليوم (السؤال ${questionCount} من ${MAX_QUESTIONS}). ممنوع تماماً طرح أي سؤال متابعة أو طلب توضيح. قدم إجابة كاملة وشاملة ومباشرة بدون أي أسئلة.`;
        } else {
            const remaining = MAX_QUESTIONS - questionCount;
            prompt += `\n\nالمستخدم لديه ${remaining} سؤال متبقي اليوم. يمكنك عند الضرورة طرح سؤال توضيحي واحد في نهاية ردك، لكن لا تفرط في الأسئلة.`;
        }

        return prompt;
    }

    async function callGemini(messages, systemPrompt) {
        const contents = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const body = {
            contents: contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.8, maxOutputTokens: 2048, topP: 0.95, topK: 40 },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
            ]
        };

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            let errMsg = 'فشل الاتصال بالذكاء الاصطناعي';
            try {
                const errData = await response.json();
                if (errData.error && errData.error.message) errMsg = errData.error.message;
            } catch (e) { }
            throw new Error(errMsg);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                throw new Error('تم حجب الرد لأسباب أمنية. جرّب سؤالاً آخر.');
            }
            throw new Error('لم أستلم رداً من الذكاء الاصطناعي');
        }

        return data.candidates[0].content.parts[0].text;
    }

    async function sendMessage() {
        const text = (els.input.value || '').trim();
        if (!text || isTyping) return;

        if (questionCount >= MAX_QUESTIONS) {
            showToast('انتهت أسئلتك اليومية. عد بعد 6 صباحاً GMT', 'error');
            return;
        }

        isTyping = true;
        els.sendBtn.disabled = true;
        els.input.value = '';
        autoResize();

        chatHistory.push({ role: 'user', content: text, timestamp: Date.now() });
        renderMessage('user', text);
        saveChat();
        updateProfileUI();

        questionCount++;
        saveCounter();
        updateCounterUI();

        const typingEl = showTypingIndicator();

        try {
            const apiMessages = chatHistory.map(m => ({ role: m.role, content: m.content }));
            const response = await callGemini(apiMessages, buildSystemPrompt());
            removeTypingIndicator(typingEl);
            chatHistory.push({ role: 'model', content: response, timestamp: Date.now() });
            saveChat();
            await renderTypingMessage('model', response);
        } catch (err) {
            removeTypingIndicator(typingEl);
            const errText = 'عذراً، حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى.\n\n**تفاصيل:** ' + escapeHtml(err.message || 'خطأ غير معروف');
            renderMessage('model', errText);
        } finally {
            isTyping = false;
            updateCounterUI();
            updateProfileUI();
            if (els.input && questionCount < MAX_QUESTIONS) els.input.focus();
        }
    }

    function showToast(msg, type) {
        type = type || 'info';
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(msg)}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function openSettings() {
        if (!els.settingsModal) return;
        document.getElementById('pf-name').value = userProfile.name || '';
        document.getElementById('pf-age').value = userProfile.age || '';
        document.getElementById('pf-gender').value = userProfile.gender || '';
        document.getElementById('pf-height').value = userProfile.height || '';
        document.getElementById('pf-weight').value = userProfile.weight || '';
        document.getElementById('pf-goal').value = userProfile.goal || '';
        document.getElementById('pf-activity').value = userProfile.activity || '';
        els.settingsModal.classList.remove('hidden');
    }

    function closeSettings() {
        if (els.settingsModal) els.settingsModal.classList.add('hidden');
    }

    function saveProfileFromForm(e) {
        e.preventDefault();
        userProfile = {
            name: document.getElementById('pf-name').value.trim(),
            age: document.getElementById('pf-age').value.trim(),
            gender: document.getElementById('pf-gender').value,
            height: document.getElementById('pf-height').value.trim(),
            weight: document.getElementById('pf-weight').value.trim(),
            goal: document.getElementById('pf-goal').value,
            activity: document.getElementById('pf-activity').value
        };
        saveProfile();
        updateProfileUI();
        closeSettings();
        showToast('تم حفظ بياناتك بنجاح', 'success');
    }

    function clearChat() {
        if (!confirm('هل أنت متأكد من مسح كل المحادثة؟ لا يمكن التراجع.')) return;
        chatHistory = [];
        saveChat();
        els.messages.innerHTML = '';
        const welcome = document.createElement('div');
        welcome.className = 'welcome-screen';
        welcome.id = 'welcome-screen';
        welcome.innerHTML = `<div class="welcome-hero"><i class="fa-solid fa-robot"></i></div><h2>أهلاً بك في SHARKS AI</h2><p>مساعدك الشخصي في كل ما يخص اللياقة البدنية والتغذية والتمارين. اسألني أي حاجة عن التمرين أو الأكل أو حتى اختيار الجيم المناسب.</p><div class="suggestions" id="suggestions-container"></div>`;
        els.messages.appendChild(welcome);
        els.welcome = welcome;
        els.suggestionsContainer = document.getElementById('suggestions-container');
        renderSuggestions();
        updateProfileUI();
        showToast('تم مسح المحادثة', 'info');
    }

    function restoreHistory() {
        chatHistory = loadChat();
        if (chatHistory.length === 0) {
            renderSuggestions();
            return;
        }
        hideWelcome();
        chatHistory.forEach(msg => {
            renderMessage(msg.role, msg.content, msg.timestamp);
        });
        scrollToBottom(true);
    }

    function handleScroll() {
        const threshold = 100;
        const distance = els.messages.scrollHeight - els.messages.scrollTop - els.messages.clientHeight;
        autoScroll = distance < threshold;
        if (els.scrollBottomBtn) {
            if (distance > 200) els.scrollBottomBtn.classList.add('visible');
            else els.scrollBottomBtn.classList.remove('visible');
        }
    }

    function init() {
        currentCycleId = getCycleId();
        loadCounter();
        userProfile = loadProfile();
        updateProfileUI();
        updateCounterUI();
        startTimer();
        restoreHistory();
        renderSuggestions();

        if (els.input) {
            els.input.addEventListener('input', autoResize);
            els.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        if (els.sendBtn) els.sendBtn.addEventListener('click', sendMessage);
        if (els.profileCard) els.profileCard.addEventListener('click', openSettings);

        const openSettingsBtn = document.getElementById('open-settings-btn');
        if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettings);

        const sidebarSettingsBtn = document.getElementById('sidebar-settings-btn');
        if (sidebarSettingsBtn) sidebarSettingsBtn.addEventListener('click', openSettings);

        const closeSettingsBtn = document.getElementById('close-settings-btn');
        if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);

        const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
        if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', closeSettings);

        if (els.profileForm) els.profileForm.addEventListener('submit', saveProfileFromForm);

        const clearChatBtn = document.getElementById('clear-chat-btn');
        if (clearChatBtn) clearChatBtn.addEventListener('click', clearChat);

        if (els.messages) els.messages.addEventListener('scroll', handleScroll);

        if (els.scrollBottomBtn) {
            els.scrollBottomBtn.addEventListener('click', () => {
                autoScroll = true;
                scrollToBottom(true);
                els.scrollBottomBtn.classList.remove('visible');
            });
        }

        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', () => {
                els.sidebar.classList.toggle('open');
            });
        }

        if (els.settingsModal) {
            els.settingsModal.addEventListener('click', (e) => {
                if (e.target === els.settingsModal) closeSettings();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && els.settingsModal && !els.settingsModal.classList.contains('hidden')) {
                closeSettings();
            }
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && els.sidebar.classList.contains('open')) {
                const menuBtn = document.getElementById('menu-toggle-btn');
                if (!els.sidebar.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
                    els.sidebar.classList.remove('open');
                }
            }
        });

        window.addEventListener('beforeunload', saveChat);
        autoResize();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
