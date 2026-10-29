/* =========================================
   1. إعدادات عامة والمتغيرات
   ========================================= */
let currentUser = null; // هيحفظ بيانات المستخدم بعد تسجيل الدخول
let currentLang = 'ar'; // اللغة الافتراضية

// تشغيل الكود بعد تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupMobileMenu();
});

/* =========================================
   2. التنقل بين الصفحات (Single Page App)
   ========================================= */
function showView(viewId) {
    // 1. إخفاء كل الصفحات
    const allViews = document.querySelectorAll('.view-section');
    allViews.forEach(view => view.classList.add('hidden'));

    // 2. إظهار الصفحة المطلوبة
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    }

    // 3. تحديث الشريط الجانبي (Active State)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // بنجيب اللينك اللي بيشاور على الصفحة دي ونخليه Active
    // (طريقة بسيطة: بنعتمد على الترتيب أو بنضيف data-attribute، بس هنا هنعملها يدوي)
    if (viewId === 'home') document.querySelector('.nav-item:nth-child(1)').classList.add('active');
    if (viewId === 'calories') document.querySelector('.nav-item:nth-child(2)').classList.add('active');
    if (viewId === 'favorites') document.querySelector('.nav-item:nth-child(3)').classList.add('active');
    if (viewId === 'top10') document.querySelector('.nav-item:nth-child(4)').classList.add('active');
    if (viewId === 'about') document.querySelector('.nav-item:nth-child(8)').classList.add('active');
    if (viewId === 'who') document.querySelector('.nav-item:nth-child(9)').classList.add('active');
    if (viewId === 'settings') document.querySelector('.nav-item:nth-child(10)').classList.add('active');

    // قفل الشريط الجانبي في الموبايل بعد اختيار صفحة
    if (window.innerWidth <= 900) {
        document.querySelector('.sidebar').classList.remove('open');
    }

    // طلوع لأول الصفحة
    window.scrollTo(0, 0);
}

/* =========================================
   3. نظام المصادقة (تسجيل الدخول واستكمال البيانات)
   ========================================= */
function checkAuthState() {
    // بنشوف لو المستخدم مسجل دخول قبل كده (محاكاة باستخدام LocalStorage)
    const savedUser = localStorage.getItem('sharks_user');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateSidebarProfile();
        showView('home'); // يفتح الرئيسية لو مسجل
    } else {
        showView('home'); // يفتح الرئيسية كزائر
    }
}

// محاكاة تسجيل الدخول بجوجل
document.getElementById('google-login-btn')?.addEventListener('click', () => {
    // هنا بنعمل Loading وهمي
    const btn = document.getElementById('google-login-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...';
    
    setTimeout(() => {
        // بنخفي شاشة الدخول ونظهر شاشة استكمال البيانات
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('profile-section').classList.remove('hidden');
        document.getElementById('reg-email').value = "user@gmail.com"; // محاكاة الإيميل من جوجل
        btn.innerHTML = '<i class="fa-brands fa-google"></i> تسجيل الدخول باستخدام Google';
    }, 1000);
});

// حفظ الملف الشخصي
document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // بنجمع البيانات من الفورم
    const newUser = {
        name: document.getElementById('reg-name').value,
        username: document.getElementById('reg-username').value,
        phone: document.getElementById('reg-phone').value,
        gov: document.getElementById('reg-gov').value,
        city: document.getElementById('reg-city').value,
        email: document.getElementById('reg-email').value
    };

    // بنحفظه في المتصفح
    localStorage.setItem('sharks_user', JSON.stringify(newUser));
    currentUser = newUser;

    // بنحدث الشريط الجانبي
    updateSidebarProfile();
    
    // بنظهر إشعار نجاح
    showToast('تم حفظ بياناتك بنجاح! أهلاً بك في SHARKS', 'success');
    
    // بنرجع المستخدم للصفحة الرئيسية
    showView('home');
});

function updateSidebarProfile() {
    const profileDiv = document.getElementById('sidebar-profile');
    if (!profileDiv) return;

    if (currentUser) {
        profileDiv.innerHTML = `
            <div class="user-avatar" style="background-color: var(--primary-blue);">
                ${currentUser.name.charAt(0)}
            </div>
            <div class="user-info">
                <div style="font-size: 14px; font-weight: 700; color: white;">${currentUser.name.split(' ')[0]}</div>
                <div style="font-size: 12px; color: var(--text-muted);">عرض الملف الشخصي</div>
            </div>
        `;
        // لو المستخدم مسجل، الضغط على البروفايل يفتح الإعدادات
        profileDiv.onclick = () => showView('settings');
    } else {
        profileDiv.innerHTML = `
            <div class="user-avatar">U</div>
            <div class="user-info">
                <div style="font-size: 14px; font-weight: 700;">تسجيل الدخول</div>
                <div style="font-size: 12px; color: var(--text-muted);">اضغط هنا</div>
            </div>
        `;
        profileDiv.onclick = () => showView('login');
    }
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('sharks_user');
    currentUser = null;
    updateSidebarProfile();
    showToast('تم تسجيل الخروج بنجاح', 'info');
    showView('home');
}

// دالة بتتأكد إن المستخدم مسجل قبل ما يعمل حاجة (زي التقييم أو التواصل)
function requireLogin() {
    if (!currentUser) {
        showToast('يجب تسجيل الدخول أولاً للقيام بهذا الإجراء', 'error');
        showView('login');
        return false;
    }
    return true;
}

/* =========================================
   4. حاسبة السعرات الحرارية
   ========================================= */
document.getElementById('calorie-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    // سحب القيم من الفورم
    const age = parseInt(document.getElementById('calc-age').value);
    const gender = document.getElementById('calc-gender').value;
    const height = parseFloat(document.getElementById('calc-height').value);
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const activity = parseFloat(document.getElementById('calc-activity').value);
    const goal = document.getElementById('calc-goal').value;

    // معادلة Mifflin-St Jeor لحساب BMR (معدل الأيض الأساسي)
    let bmr = 0;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // حساب السعرات بناءً على النشاط (TDEE)
    let tdee = bmr * activity;

    // تعديل السعرات بناءً على الهدف
    let finalCalories = tdee;
    if (goal === 'lose') finalCalories -= 500; // عجز حراري
    if (goal === 'gain') finalCalories += 500; // زيادة حرارية

    // توزيع الماكروز (بروتين 30%، كارب 40%، دهون 30%)
    const protein = Math.round((finalCalories * 0.30) / 4); // 4 سعرات للجرام
    const carbs = Math.round((finalCalories * 0.40) / 4); // 4 سعرات للجرام
    const fats = Math.round((finalCalories * 0.30) / 9); // 9 سعرات للجرام

    // عرض النتائج
    document.getElementById('result-calories').innerText = Math.round(finalCalories);
    
    document.getElementById('macros-result').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-top: 15px; gap: 10px;">
            <div style="background: var(--bg-card); padding: 10px; border-radius: 10px; flex: 1; border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-muted);">بروتين</div>
                <div style="font-weight: 700; color: #FF4757;">${protein} جم</div>
            </div>
            <div style="background: var(--bg-card); padding: 10px; border-radius: 10px; flex: 1; border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-muted);">كربوهيدرات</div>
                <div style="font-weight: 700; color: #FFA502;">${carbs} جم</div>
            </div>
            <div style="background: var(--bg-card); padding: 10px; border-radius: 10px; flex: 1; border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-muted);">دهون</div>
                <div style="font-weight: 700; color: #2ED573;">${fats} جم</div>
            </div>
        </div>
    `;

    // إظهار صندوق النتائج
    document.getElementById('calorie-result').classList.remove('hidden');
});

/* =========================================
   5. المفضلة (محاكاة)
   ========================================= */
let isFavorite = false;

function toggleFavorite() {
    if (!requireLogin()) return; // لازم يكون مسجل

    isFavorite = !isFavorite;
    const favBtn = document.getElementById('fav-btn');
    
    if (isFavorite) {
        favBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #FF4757;"></i>';
        showToast('تمت الإضافة إلى المفضلة', 'success');
    } else {
        favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        showToast('تمت الإزالة من المفضلة', 'info');
    }
}

/* =========================================
   6. تغيير اللغة (RTL / LTR)
   ========================================= */
function toggleLanguage() {
    const htmlTag = document.documentElement;
    const langBtn = document.getElementById('lang-btn');

    if (currentLang === 'ar') {
        // التحويل للإنجليزي
        htmlTag.setAttribute('dir', 'ltr');
        htmlTag.setAttribute('lang', 'en');
        currentLang = 'en';
        langBtn.innerText = 'AR';
        
        // تغيير النصوص الأساسية (مثال بسيط)
        document.querySelector('.search-bar input').placeholder = "Search for a gym...";
        showToast('Language changed to English', 'info');
    } else {
        // التحويل للعربي
        htmlTag.setAttribute('dir', 'rtl');
        htmlTag.setAttribute('lang', 'ar');
        currentLang = 'ar';
        langBtn.innerText = 'EN';
        
        // تغيير النصوص الأساسية
        document.querySelector('.search-bar input').placeholder = "ابحث عن جيم، منطقة، أو ميزة...";
        showToast('تم تغيير اللغة إلى العربية', 'info');
    }
}

/* =========================================
   7. إشعارات التنبيه (Toast Notifications)
   ========================================= */
function showToast(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    
    // ستايل الإشعار (ممكن ننقله للـ CSS بعدين)
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '12px';
    toast.style.color = 'white';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    toast.style.transition = 'opacity 0.3s ease';
    
    if (type === 'success') toast.style.backgroundColor = '#2ED573';
    else if (type === 'error') toast.style.backgroundColor = '#FF4757';
    else toast.style.backgroundColor = '#0055FF';

    document.body.appendChild(toast);

    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* =========================================
   8. قائمة الموبايل (Responsive Menu)
   ========================================= */
function setupMobileMenu() {
    // ضفنا زرار القائمة في الـ JS عشان منطولش كود الـ HTML
    const header = document.querySelector('.top-header');
    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn-icon';
    menuBtn.style.display = window.innerWidth <= 900 ? 'block' : 'none';
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    
    // إضافة الزرار قبل الشريط العلوي
    header.prepend(menuBtn);

    menuBtn.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });

    // إخفاء الزرار لو الشاشة كبرت
    window.addEventListener('resize', () => {
        menuBtn.style.display = window.innerWidth <= 900 ? 'block' : 'none';
        if(window.innerWidth > 900) {
            document.querySelector('.sidebar').classList.remove('open');
        }
    });
}
