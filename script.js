/* =========================================================
   SHARKS - Main Script (Standalone - Works without server)
   ========================================================= */
(function () {
    'use strict';

    /* ============ STATE ============ */
    let currentLang = 'ar';
    let currentUser = null;

    /* ============ TRANSLATIONS ============ */
    const arToEn = {
        // Nav
        'الرئيسية': 'Home',
        'السعرات الحرارية': 'Calories',
        'المفضلة': 'Favorites',
        'أفضل 10 جيمات': 'Top 10 Gyms',
        'الرسائل': 'Messages',
        'المتجر': 'Store',
        'المدربون': 'Coaches',
        'حول': 'About',
        'من نحن': 'Who We Are',
        'الإعدادات': 'Settings',
        // Top
        'تسجيل الدخول': 'Login',
        'اضغط هنا': 'Click here',
        'EN': 'AR',
        // Search
        'ابحث عن جيم، منطقة، أو ميزة...': 'Search for a gym, area, or feature...',
        // Sections
        'أفضل 3 جيمات هذا الشهر': 'Top 3 Gyms This Month',
        'الجيمات الأقرب إليك': 'Nearby Gyms',
        'كل الجيمات': 'All Gyms',
        'عرض الكل': 'View All',
        // Cards
        'جولدز جيم': "Gold's Gym",
        'فيتنس فيرست': 'Fitness First',
        'ماي جيم': 'My Gym',
        'القاهرة، مدينة نصر': 'Cairo, Nasr City',
        'الجيزة، المهندسين': 'Giza, Mohandessin',
        'الإسكندرية، سموحة': 'Alexandria, Smouha',
        'المركز الأول': '1st Place',
        'المركز الثاني': '2nd Place',
        'المركز الثالث': '3rd Place',
        'التفاصيل': 'Details',
        // Login
        'مرحباً بك في SHARKS': 'Welcome to SHARKS',
        'اكتشف أفضل الجيمات في مصر، قيم تجربتك، وتابع أهدافك.': 'Discover the best gyms in Egypt, rate your experience, and track your goals.',
        'تسجيل الدخول باستخدام Google': 'Sign in with Google',
        'استكمال الملف الشخصي': 'Complete Profile',
        'محتاجين شوية بيانات عشان نكمل معاك.': 'We need some data to continue.',
        'الاسم الرباعي': 'Full Name',
        'اسم المستخدم': 'Username',
        'رقم الهاتف': 'Phone Number',
        'المحافظة': 'Governorate',
        'المركز / المنطقة': 'City / Area',
        'البريد الإلكتروني': 'Email',
        'حفظ ومتابعة': 'Save & Continue',
        'القاهرة': 'Cairo',
        'الجيزة': 'Giza',
        'الإسكندرية': 'Alexandria',
        // Details
        'رجوع': 'Back',
        'اتصال': 'Call',
        'واتساب': 'WhatsApp',
        'الموقع': 'Location',
        'التقييمات': 'Reviews',
        'قيم تجربتك': 'Rate your experience',
        'يجب تسجيل الدخول لتتمكن من التقييم.': 'You must login to rate.',
        'أضف تقييمك': 'Add Review',
        'معلومات إضافية': 'Extra Info',
        'الأسعار:': 'Price:',
        'آخر تحديث:': 'Last Update:',
        'الحالة:': 'Status:',
        'الإبلاغ عن بيانات خاطئة': 'Report wrong data',
        'تبدأ من 500 جنيه / شهر': 'Starts from 500 EGP / month',
        '15 أكتوبر 2026': '15 Oct 2026',
        'موثّق': 'Verified',
        'الأجهزة والمعدات': 'Equipment',
        'النظافة': 'Cleanliness',
        'المكان والموقع': 'Location',
        'التعامل وخدمة العملاء': 'Staff & Service',
        'النظام والتنظيم': 'Organization',
        'السعر': 'Price',
        // Messages
        'أهلاً بك في SHARKS': 'Welcome to SHARKS',
        'شكراً لانضمامك إلينا. ابدأ باكتشاف الجيمات القريبة منك.': 'Thanks for joining. Start discovering nearby gyms.',
        'منذ ساعتين': '2 hours ago',
        'إعلان الفائزين الشهريين': 'Monthly Winners Announced',
        'تم إعلان أفضل 3 جيمات لهذا الشهر. تصفح الصفحة الرئيسية لمعرفة الفائزين.': 'Top 3 gyms this month announced. Check the home page.',
        'منذ يوم': '1 day ago',
        // Calculator
        'حاسبة السعرات الحرارية': 'Calorie Calculator',
        'العمر': 'Age',
        'الجنس': 'Gender',
        'ذكر': 'Male',
        'أنثى': 'Female',
        'الطول (سم)': 'Height (cm)',
        'الوزن (كجم)': 'Weight (kg)',
        'مستوى النشاط': 'Activity Level',
        'قليل الحركة': 'Sedentary',
        'نشاط خفيف': 'Light Activity',
        'نشاط متوسط': 'Moderate Activity',
        'نشاط عالي': 'High Activity',
        'الهدف': 'Goal',
        'خفض الدهون': 'Lose Fat',
        'المحافظة على الوزن': 'Maintain Weight',
        'بناء العضلات': 'Build Muscle',
        'احسب': 'Calculate',
        'احتياجك اليومي:': 'Daily Need:',
        'سعرة حرارية': 'Calories',
        // Favorites
        'لا توجد جيمات في المفضلة حالياً.': 'No favorite gyms yet.',
        // Settings
        'الحساب': 'Account',
        'تعديل البيانات الشخصية': 'Edit Profile',
        'تفضيلات الإشعارات': 'Notifications',
        'إذن الموقع': 'Location Permission',
        'العرض': 'Display',
        'إظهار قسم أفضل 3 جيمات': 'Show Top 3 Section',
        'عن المنصة': 'About Platform',
        'تسجيل الخروج': 'Logout',
        // About / Who
        'حول SHARKS': 'About SHARKS',
        'كيفية استخدام المنصة': 'How to use',
        '1. ابحث عن الجيمات في منطقتك من خلال الصفحة الرئيسية.': '1. Search for gyms in your area from the home page.',
        '2. تصفح التفاصيل، الصور، والأسعار.': '2. Browse details, photos, and prices.',
        '3. قيم الجيم بناءً على 6 معايير (أجهزة، نظافة، مكان، تعامل، نظام، سعر).': '3. Rate the gym based on 6 criteria.',
        '4. استخدم حاسبة السعرات لمعرفة احتياجك اليومي.': '4. Use the calorie calculator.',
        'آلية التقييم الشهرية': 'Monthly Rating System',
        'يتم احتساب التقييمات كل شهر، ويتم إعلان أفضل 3 جيمات وتثبيتهم لمدة 10 أيام على الصفحة الرئيسية.': 'Ratings calculated monthly, top 3 pinned for 10 days.',
        'رؤيتنا': 'Our Vision',
        'أن نكون المنصة الأولى في مصر لاكتشاف وتقييم الجيمات، لنساعد كل شخص على تحقيق أهدافه الرياضية.': "To be Egypt's #1 platform for gym discovery.",
        'رسالتنا': 'Our Mission',
        'توفير بيانات دقيقة وشفافة عن الجيمات، مع تجربة مستخدم احترافية تدعم اللغتين العربية والإنجليزية.': 'Provide accurate gym data with a professional experience.',
        'تواصل معنا': 'Contact Us'
    };

    const enToAr = {};
    Object.keys(arToEn).forEach(k => { enToAr[arToEn[k]] = k; });

    /* ============ SHOW VIEW ============ */
    window.showView = function (viewId) {
        document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
        const target = document.getElementById('view-' + viewId);
        if (target) {
            target.classList.remove('hidden');
            target.style.animation = 'none';
            void target.offsetHeight;
            target.style.animation = '';
        }
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
        window.scrollTo(0, 0);
    };

    /* ============ LANGUAGE TOGGLE ============ */
    window.toggleLanguage = function () {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', currentLang);
        document.getElementById('lang-btn').innerText = currentLang === 'ar' ? 'EN' : 'AR';

        const dict = currentLang === 'en' ? arToEn : enToAr;

        // Translate all text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        let n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(node => {
            const text = node.nodeValue.trim();
            if (text && dict[text]) {
                node.nodeValue = node.nodeValue.replace(text, dict[text]);
            }
        });

        // Translate placeholders
        document.querySelectorAll('[placeholder]').forEach(el => {
            const ph = el.getAttribute('placeholder');
            if (dict[ph]) el.setAttribute('placeholder', dict[ph]);
        });

        // Translate select options
        document.querySelectorAll('select option').forEach(opt => {
            const t = opt.textContent.trim();
            if (dict[t]) opt.textContent = dict[t];
        });

        showToast(currentLang === 'ar' ? 'تم تغيير اللغة' : 'Language changed', 'info');
    };

    /* ============ CARD CLICKS -> DETAILS ============ */
    function setupCardClicks() {
        document.querySelectorAll('#view-home .gym-card').forEach(card => {
            card.onclick = function (e) {
                const title = this.querySelector('.card-title')?.textContent?.trim() || '';
                const location = this.querySelector('.card-location')?.textContent?.trim() || '';
                const imageEl = this.querySelector('.card-image');
                const image = imageEl ? imageEl.style.backgroundImage : '';

                populateDetails(title, location, image);
                showView('details');
            };
        });
    }

    function populateDetails(title, location, image) {
        const titleEl = document.getElementById('details-title');
        const locEl = document.getElementById('details-location');
        const coverEl = document.getElementById('details-cover');

        if (titleEl) {
            const isVerified = title === "Gold's Gym" || title === 'جولدز جيم' || title === 'Fitness First' || title === 'فيتنس فيرست';
            titleEl.innerHTML = title + (isVerified ? ' <i class="fa-solid fa-circle-check verified-icon"></i>' : '');
        }
        if (locEl) locEl.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + location;
        if (coverEl && image) coverEl.style.backgroundImage = image;
    }

    /* ============ SEARCH ============ */
    function setupSearch() {
        const input = document.getElementById('global-search');
        if (!input) return;
        input.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            document.querySelectorAll('#view-home .gym-card').forEach(card => {
                const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
                const loc = (card.querySelector('.card-location')?.textContent || '').toLowerCase();
                const match = !term || title.includes(term) || loc.includes(term);
                card.style.display = match ? '' : 'none';
            });
        });
    }

    /* ============ CALORIE CALCULATOR ============ */
    function setupCalculator() {
        const form = document.getElementById('calorie-form');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const age = parseInt(document.getElementById('calc-age').value) || 0;
            const gender = document.getElementById('calc-gender').value;
            const height = parseFloat(document.getElementById('calc-height').value) || 0;
            const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
            const activity = parseFloat(document.getElementById('calc-activity').value) || 1.2;
            const goal = document.getElementById('calc-goal').value;

            if (!age || !height || !weight) {
                showToast(currentLang === 'ar' ? 'أدخل كل البيانات' : 'Please enter all data', 'error');
                return;
            }

            const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
            let tdee = bmr * activity;
            if (goal === 'lose') tdee -= 500;
            if (goal === 'gain') tdee += 500;

            const protein = Math.round((tdee * 0.30) / 4);
            const carbs = Math.round((tdee * 0.40) / 4);
            const fats = Math.round((tdee * 0.30) / 9);

            document.getElementById('result-calories').innerText = Math.round(tdee);
            document.getElementById('macros-result').innerHTML = `
                <div style="display:flex;justify-content:space-between;gap:10px;margin-top:15px;">
                    <div style="flex:1;background:var(--bg-card);padding:10px;border-radius:10px;border:1px solid var(--border-color);">
                        <div style="font-size:12px;color:var(--text-muted);">${currentLang === 'ar' ? 'بروتين' : 'Protein'}</div>
                        <div style="font-weight:700;color:#FF4757;">${protein} g</div>
                    </div>
                    <div style="flex:1;background:var(--bg-card);padding:10px;border-radius:10px;border:1px solid var(--border-color);">
                        <div style="font-size:12px;color:var(--text-muted);">${currentLang === 'ar' ? 'كارب' : 'Carbs'}</div>
                        <div style="font-weight:700;color:#FFA502;">${carbs} g</div>
                    </div>
                    <div style="flex:1;background:var(--bg-card);padding:10px;border-radius:10px;border:1px solid var(--border-color);">
                        <div style="font-size:12px;color:var(--text-muted);">${currentLang === 'ar' ? 'دهون' : 'Fats'}</div>
                        <div style="font-weight:700;color:#2ED573;">${fats} g</div>
                    </div>
                </div>`;
            document.getElementById('calorie-result').classList.remove('hidden');
        });
    }

    /* ============ TOP 3 TOGGLE ============ */
    window.toggleTop3Visibility = function (checkbox) {
        const section = document.getElementById('top3-section');
        if (checkbox.checked) {
            section.style.display = '';
            localStorage.setItem('hideTop3', 'false');
            showToast(currentLang === 'ar' ? 'تم إظهار قسم أفضل 3' : 'Top 3 shown', 'success');
        } else {
            section.style.display = 'none';
            localStorage.setItem('hideTop3', 'true');
            showToast(currentLang === 'ar' ? 'تم إخفاء قسم أفضل 3' : 'Top 3 hidden', 'info');
        }
    };

    /* ============ LOGIN (localStorage Simulation) ============ */
    function setupLogin() {
        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) {
            googleBtn.onclick = function () {
                googleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
                setTimeout(() => {
                    document.getElementById('login-section').classList.add('hidden');
                    document.getElementById('profile-section').classList.remove('hidden');
                    document.getElementById('reg-email').value = 'user@gmail.com';
                    googleBtn.innerHTML = '<i class="fa-brands fa-google"></i> ' + (currentLang === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google');
                }, 800);
            };
        }

        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                currentUser = {
                    name: document.getElementById('reg-name').value.trim(),
                    username: document.getElementById('reg-username').value.trim(),
                    phone: document.getElementById('reg-phone').value.trim(),
                    gov: document.getElementById('reg-gov').value,
                    city: document.getElementById('reg-city').value.trim(),
                    email: document.getElementById('reg-email').value
                };
                localStorage.setItem('sharks_user', JSON.stringify(currentUser));
                updateProfileUI();
                showToast(currentLang === 'ar' ? 'تم حفظ بياناتك بنجاح!' : 'Profile saved!', 'success');
                document.getElementById('profile-section').classList.add('hidden');
                document.getElementById('login-section').classList.remove('hidden');
                form.reset();
                showView('home');
            });
        }
    }

    function updateProfileUI() {
        const avatar = document.getElementById('sidebar-avatar');
        const name = document.getElementById('sidebar-username');
        const status = document.getElementById('sidebar-userstatus');
        const profile = document.getElementById('sidebar-profile');
        if (!avatar || !name) return;

        if (currentUser) {
            avatar.innerText = currentUser.name.charAt(0).toUpperCase();
            name.innerText = currentUser.name.split(' ')[0];
            status.innerText = currentLang === 'ar' ? 'عرض الملف الشخصي' : 'View Profile';
            if (profile) profile.onclick = () => showView('settings');
        } else {
            avatar.innerText = 'U';
            name.innerText = currentLang === 'ar' ? 'تسجيل الدخول' : 'Login';
            status.innerText = currentLang === 'ar' ? 'اضغط هنا' : 'Click here';
            if (profile) profile.onclick = () => showView('login');
        }
    }

    window.handleProfileClick = function () {
        if (currentUser) showView('settings');
        else showView('login');
    };

    window.logout = function () {
        localStorage.removeItem('sharks_user');
        currentUser = null;
        updateProfileUI();
        showToast(currentLang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out', 'info');
        showView('home');
    };

    /* ============ FAVORITES ============ */
    window.toggleFavorite = function () {
        if (!currentUser) {
            showToast(currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'error');
            showView('login');
            return;
        }
        const btn = document.getElementById('fav-btn');
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-regular')) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#FF4757';
            showToast(currentLang === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to favorites', 'success');
        } else {
            icon.classList.add('fa-regular');
            icon.classList.remove('fa-solid');
            icon.style.color = '';
            showToast(currentLang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites', 'info');
        }
    };

    /* ============ MOBILE MENU ============ */
    function setupMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        if (btn) {
            btn.onclick = function () {
                document.getElementById('sidebar').classList.toggle('open');
            };
        }
    }

    /* ============ TOAST ============ */
    function showToast(message, type) {
        type = type || 'info';
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* ============ LOAD SAVED STATE ============ */
    function loadState() {
        const saved = localStorage.getItem('sharks_user');
        if (saved) {
            try {
                currentUser = JSON.parse(saved);
                updateProfileUI();
            } catch (e) { /* ignore */ }
        }

        const hideTop3 = localStorage.getItem('hideTop3');
        if (hideTop3 === 'true') {
            const cb = document.getElementById('toggle-top3');
            if (cb) cb.checked = false;
            const section = document.getElementById('top3-section');
            if (section) section.style.display = 'none';
        }
    }

    /* ============ INIT ============ */
    document.addEventListener('DOMContentLoaded', function () {
        setupCardClicks();
        setupSearch();
        setupCalculator();
        setupLogin();
        setupMobileMenu();
        loadState();
        updateProfileUI();
        console.log('SHARKS App Ready ✅');
    });

})();
