/* =========================================
   1. إعدادات Firebase (الربط الحقيقي)
   ========================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// الإعدادات الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDzV2fbYR6umCmASccJ36s2AKll8nMJAr8",
  authDomain: "sharks-f91e7.firebaseapp.com",
  projectId: "sharks-f91e7",
  storageBucket: "sharks-f91e7.firebasestorage.app",
  messagingSenderId: "817691988848",
  appId: "1:817691988848:web:31fdb1cf2cd0ac2c8ff5b5",
  measurementId: "G-DJEPG9J1SP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================================
   2. قاموس الترجمة الشامل (i18n)
   ========================================= */
const translations = {
    ar: {
        nav_home: "الرئيسية", nav_calories: "السعرات الحرارية", nav_favorites: "المفضلة",
        nav_top10: "أفضل 10 جيمات", nav_messages: "الرسائل", nav_ai: "SHARKS AI",
        nav_store: "المتجر", nav_coaches: "المدربون", nav_about: "حول", nav_who: "من نحن", nav_settings: "الإعدادات",
        login: "تسجيل الدخول", click_here: "اضغط هنا", search_placeholder: "ابحث عن جيم، منطقة، أو ميزة...",
        top3_title: "أفضل 3 جيمات هذا الشهر", nearby_title: "الجيمات الأقرب إليك", all_gyms_title: "كل الجيمات",
        view_all: "عرض الكل", login_title: "مرحباً بك في SHARKS", login_subtitle: "اكتشف أفضل الجيمات في مصر، قيم تجربتك، وتابع أهدافك.",
        login_google: "تسجيل الدخول باستخدام Google", profile_title: "استكمال الملف الشخصي", profile_subtitle: "محتاجين شوية بيانات عشان نكمل معاك.",
        full_name: "الاسم الرباعي", username: "اسم المستخدم", phone: "رقم الهاتف", governorate: "المحافظة",
        cairo: "القاهرة", giza: "الجيزة", alex: "الإسكندرية", city: "المركز / المنطقة", email: "البريد الإلكتروني",
        save_continue: "حفظ ومتابعة", back: "رجوع", call: "اتصال", whatsapp: "واتساب", map: "الموقع",
        reviews_title: "التقييمات", rate_experience: "قيم تجربتك", login_to_rate: "يجب تسجيل الدخول لتتمكن من التقييم.",
        add_review: "أضف تقييمك", extra_info: "معلومات إضافية", price: "الأسعار:", last_update: "آخر تحديث:",
        status: "الحالة:", report: "الإبلاغ عن بيانات خاطئة", messages_title: "الرسائل",
        msg_welcome_title: "أهلاً بك في SHARKS", msg_welcome_body: "شكراً لانضمامك إلينا. ابدأ باكتشاف الجيمات القريبة منك.",
        msg_winner_title: "إعلان الفائزين الشهريين", msg_winner_body: "تم إعلان أفضل 3 جيمات لهذا الشهر. تصفح الصفحة الرئيسية لمعرفة الفائزين.",
        calories_title: "حاسبة السعرات الحرارية", age: "العمر", gender: "الجنس", male: "ذكر", female: "أنثى",
        height: "الطول (سم)", weight: "الوزن (كجم)", activity: "مستوى النشاط", sedentary: "قليل الحركة",
        light: "نشاط خفيف", moderate: "نشاط متوسط", active: "نشاط عالي", goal: "الهدف", lose: "خفض الدهون",
        maintain: "المحافظة على الوزن", gain: "بناء العضلات", calculate: "احسب", daily_need: "احتياجك اليومي:",
        calories_unit: "سعرة حرارية", favorites_title: "المفضلة", no_favorites: "لا توجد جيمات في المفضلة حالياً.",
        top10_title: "أفضل 10 جيمات", settings_title: "الإعدادات", account_settings: "الحساب",
        edit_profile: "تعديل البيانات الشخصية", notifications: "تفضيلات الإشعارات", location_permission: "إذن الموقع",
        display_settings: "العرض", show_top3: "إظهار قسم أفضل 3 جيمات", about_platform: "عن المنصة", logout: "تسجيل الخروج",
        about_title: "حول SHARKS", about_how_to_use: "كيفية استخدام المنصة", about_step1: "1. ابحث عن الجيمات في منطقتك من خلال الصفحة الرئيسية.",
        about_step2: "2. تصفح التفاصيل، الصور، والأسعار.", about_step3: "3. قيم الجيم بناءً على 6 معايير.",
        about_step4: "4. استخدم حاسبة السعرات لمعرفة احتياجك اليومي.", about_monthly_system: "آلية التقييم الشهرية",
        about_monthly_desc: "يتم احتساب التقييمات كل شهر، ويتم إعلان أفضل 3 جيمات وتثبيتهم لمدة 10 أيام.",
        who_title: "من نحن", who_vision: "رؤيتنا", who_vision_desc: "أن نكون المنصة الأولى في مصر لاكتشاف وتقييم الجيمات.",
        who_mission: "رسالتنا", who_mission_desc: "توفير بيانات دقيقة وشفافة عن الجيمات.", who_contact: "تواصل معنا"
    },
    en: {
        nav_home: "Home", nav_calories: "Calories", nav_favorites: "Favorites",
        nav_top10: "Top 10 Gyms", nav_messages: "Messages", nav_ai: "SHARKS AI",
        nav_store: "Store", nav_coaches: "Coaches", nav_about: "About", nav_who: "Who We Are", nav_settings: "Settings",
        login: "Login", click_here: "Click here", search_placeholder: "Search for a gym, area, or feature...",
        top3_title: "Top 3 Gyms This Month", nearby_title: "Nearby Gyms", all_gyms_title: "All Gyms",
        view_all: "View All", login_title: "Welcome to SHARKS", login_subtitle: "Discover the best gyms in Egypt.",
        login_google: "Sign in with Google", profile_title: "Complete Profile", profile_subtitle: "We need some data to continue.",
        full_name: "Full Name", username: "Username", phone: "Phone Number", governorate: "Governorate",
        cairo: "Cairo", giza: "Giza", alex: "Alexandria", city: "City / Area", email: "Email",
        save_continue: "Save & Continue", back: "Back", call: "Call", whatsapp: "WhatsApp", map: "Location",
        reviews_title: "Reviews", rate_experience: "Rate your experience", login_to_rate: "You must login to rate.",
        add_review: "Add Review", extra_info: "Extra Info", price: "Price:", last_update: "Last Update:",
        status: "Status:", report: "Report wrong data", messages_title: "Messages",
        msg_welcome_title: "Welcome to SHARKS", msg_welcome_body: "Thanks for joining us. Start discovering nearby gyms.",
        msg_winner_title: "Monthly Winners Announced", msg_winner_body: "Top 3 gyms for this month have been announced. Check the home page.",
        calories_title: "Calorie Calculator", age: "Age", gender: "Gender", male: "Male", female: "Female",
        height: "Height (cm)", weight: "Weight (kg)", activity: "Activity Level", sedentary: "Sedentary",
        light: "Lightly Active", moderate: "Moderately Active", active: "Very Active", goal: "Goal", lose: "Lose Fat",
        maintain: "Maintain Weight", gain: "Build Muscle", calculate: "Calculate", daily_need: "Daily Need:",
        calories_unit: "Calories", favorites_title: "Favorites", no_favorites: "No favorite gyms yet.",
        top10_title: "Top 10 Gyms", settings_title: "Settings", account_settings: "Account",
        edit_profile: "Edit Profile", notifications: "Notification Preferences", location_permission: "Location Permission",
        display_settings: "Display", show_top3: "Show Top 3 Gyms Section", about_platform: "About Platform", logout: "Logout",
        about_title: "About SHARKS", about_how_to_use: "How to use", about_step1: "1. Search for gyms in your area.",
        about_step2: "2. Browse details, photos, and prices.", about_step3: "3. Rate based on 6 criteria.",
        about_step4: "4. Use the calorie calculator.", about_monthly_system: "Monthly Rating System",
        about_monthly_desc: "Ratings are calculated monthly, and the top 3 are pinned for 10 days.",
        who_title: "Who We Are", who_vision: "Our Vision", who_vision_desc: "To be Egypt's #1 platform for gym discovery.",
        who_mission: "Our Mission", who_mission_desc: "Provide accurate and transparent gym data.", who_contact: "Contact Us"
    }
};

/* =========================================
   3. البيانات الأولية (Mock Data) - لحد ما Firestore يتملي
   ========================================= */
const mockGyms = [
    { id: "g1", name: "جولدز جيم", nameEn: "Gold's Gym", location: "القاهرة، مدينة نصر", locationEn: "Cairo, Nasr City", rating: 4.9, reviews: 320, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop", verified: true, price: "500 EGP" },
    { id: "g2", name: "فيتنس فيرست", nameEn: "Fitness First", location: "الجيزة، المهندسين", locationEn: "Giza, Mohandessin", rating: 4.7, reviews: 210, image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=600&auto=format&fit=crop", verified: true, price: "600 EGP" },
    { id: "g3", name: "ماي جيم", nameEn: "My Gym", location: "الإسكندرية، سموحة", locationEn: "Alexandria, Smouha", rating: 4.5, reviews: 150, image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600&auto=format&fit=crop", verified: false, price: "400 EGP" },
    { id: "g4", name: "جيم بلس", nameEn: "Gym Plus", location: "القاهرة، المعادي", locationEn: "Cairo, Maadi", rating: 4.2, reviews: 85, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop", verified: false, price: "350 EGP" },
    { id: "g5", name: "أوليمبيا جيم", nameEn: "Olympia Gym", location: "القاهرة، مصر الجديدة", locationEn: "Cairo, Heliopolis", rating: 4.6, reviews: 112, image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", verified: true, price: "450 EGP" }
];

/* =========================================
   4. المتغيرات العامة
   ========================================= */
let currentUser = null;
let currentLang = 'ar';
let gymsData = [...mockGyms]; // بنبدأ بالبيانات التجريبية
let currentGymId = null;

/* =========================================
   5. التنقل بين الصفحات (SPA)
   ========================================= */
window.showView = function(viewId) {
    const allViews = document.querySelectorAll('.view-section');
    allViews.forEach(view => view.classList.add('hidden'));

    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        // إعادة تشغيل الأنيميشن
        targetView.style.animation = 'none';
        targetView.offsetHeight; /* trigger reflow */
        targetView.style.animation = 'slideUp 0.4s ease-out forwards';
    }

    // تحديث الشريط الجانبي
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // قفل المنيو في الموبايل
    if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
    window.scrollTo(0, 0);
};

/* =========================================
   6. عرض البيانات (Rendering)
   ========================================= */
// دالة مساعدة لإنشاء كارت جيم
function createGymCard(gym, isPodium = false, rank = 0) {
    const name = currentLang === 'ar' ? gym.name : gym.nameEn;
    const location = currentLang === 'ar' ? gym.location : gym.locationEn;
    const verifiedIcon = gym.verified ? '<i class="fa-solid fa-circle-check verified-icon"></i>' : '';
    
    // لو هو منصة تتويج (Podium)
    if (isPodium) {
        let badgeText = rank === 1 ? (currentLang === 'ar' ? 'المركز الأول' : '1st Place') : 
                        rank === 2 ? (currentLang === 'ar' ? 'المركز الثاني' : '2nd Place') : 
                                     (currentLang === 'ar' ? 'المركز الثالث' : '3rd Place');
        return `
            <div class="podium-item podium-${rank}">
                <div class="gym-card podium-card" onclick="showGymDetails('${gym.id}')">
                    <div class="badge"><i class="fa-solid fa-trophy"></i> ${badgeText}</div>
                    <div class="card-image" style="background-image: url('${gym.image}');"></div>
                    <div class="card-content">
                        <div class="card-title-row">
                            <div class="card-title">${name}</div>
                            ${verifiedIcon}
                        </div>
                        <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${location}</div>
                        <div class="card-footer">
                            <div class="rating"><i class="fa-solid fa-star"></i> ${gym.rating} <span>(${gym.reviews})</span></div>
                            <button class="btn-primary" onclick="event.stopPropagation(); showGymDetails('${gym.id}')">${translations[currentLang].view_all.replace('عرض الكل', 'التفاصيل').replace('View All', 'Details')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // كارت عادي
    return `
        <div class="gym-card" onclick="showGymDetails('${gym.id}')">
            <div class="card-image" style="background-image: url('${gym.image}');"></div>
            <div class="card-content">
                <div class="card-title-row">
                    <div class="card-title">${name}</div>
                    ${verifiedIcon}
                </div>
                <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${location}</div>
                <div class="card-footer">
                    <div class="rating"><i class="fa-solid fa-star"></i> ${gym.rating} <span>(${gym.reviews})</span></div>
                    <button class="btn-primary" onclick="event.stopPropagation(); showGymDetails('${gym.id}')">${translations[currentLang].view_all.replace('عرض الكل', 'التفاصيل').replace('View All', 'Details')}</button>
                </div>
            </div>
        </div>
    `;
}

// عرض قسم أفضل 3 (Podium) - الترتيب (تاني، أول، تالت)
function renderPodium() {
    const container = document.getElementById('podium-container');
    if (!container) return;
    
    // ناخد أعلى 3 تقييمات
    const top3 = [...gymsData].sort((a, b) => b.rating - a.rating).slice(0, 3);
    
    if (top3.length < 3) {
        container.innerHTML = '<p style="color: var(--text-muted);">Not enough data yet.</p>';
        return;
    }

    container.innerHTML = `
        ${createGymCard(top3[1], true, 2)} <!-- التاني يمين -->
        ${createGymCard(top3[0], true, 1)} <!-- الأول في النص -->
        ${createGymCard(top3[2], true, 3)} <!-- التالت شمال -->
    `;
}

// عرض الجيمات العادية
function renderGyms(gymsToRender = gymsData) {
    // قسم الجيمات القريبة (بناخد أول 2 كمثال)
    const nearbyGrid = document.getElementById('nearby-gyms-grid');
    if (nearbyGrid) {
        nearbyGrid.innerHTML = gymsToRender.slice(0, 2).map(g => createGymCard(g)).join('');
    }

    // قسم كل الجيمات
    const allGrid = document.getElementById('all-gyms-grid');
    if (allGrid) {
        allGrid.innerHTML = gymsToRender.map(g => createGymCard(g)).join('');
    }
}

// صفحة تفاصيل الجيم
window.showGymDetails = function(gymId) {
    const gym = gymsData.find(g => g.id === gymId);
    if (!gym) return;

    currentGymId = gymId;
    const name = currentLang === 'ar' ? gym.name : gym.nameEn;
    const location = currentLang === 'ar' ? gym.location : gym.locationEn;

    document.getElementById('details-cover').style.backgroundImage = `url('${gym.image}')`;
    document.getElementById('details-title').innerHTML = `${name} ${gym.verified ? '<i class="fa-solid fa-circle-check verified-icon"></i>' : ''}`;
    document.getElementById('details-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${location}`;
    document.getElementById('details-price').innerText = gym.price;
    document.getElementById('details-update').innerText = "15 Oct 2026";
    document.getElementById('details-verified').innerHTML = gym.verified ? (currentLang === 'ar' ? 'موثّق <i class="fa-solid fa-circle-check" style="color: var(--primary-blue);"></i>' : 'Verified <i class="fa-solid fa-circle-check" style="color: var(--primary-blue);"></i>') : (currentLang === 'ar' ? 'غير موثّق' : 'Not Verified');
    document.getElementById('details-review-count').innerText = `(${gym.reviews})`;

    // تقييمات ثابتة كمثال
    const criteriaHtml = `
        <div class="criteria-row"><span>${currentLang === 'ar' ? 'الأجهزة والمعدات' : 'Equipment'}</span><div class="progress-bar"><div class="progress" style="width: 90%;"></div></div><span>4.5</span></div>
        <div class="criteria-row"><span>${currentLang === 'ar' ? 'النظافة' : 'Cleanliness'}</span><div class="progress-bar"><div class="progress" style="width: 80%;"></div></div><span>4.0</span></div>
        <div class="criteria-row"><span>${currentLang === 'ar' ? 'المكان والموقع' : 'Location'}</span><div class="progress-bar"><div class="progress" style="width: 95%;"></div></div><span>4.8</span></div>
        <div class="criteria-row"><span>${currentLang === 'ar' ? 'التعامل' : 'Staff'}</span><div class="progress-bar"><div class="progress" style="width: 85%;"></div></div><span>4.3</span></div>
    `;
    document.getElementById('rating-criteria').innerHTML = criteriaHtml;

    showView('details');
};

/* =========================================
   7. نظام البحث
   ========================================= */
document.getElementById('global-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = gymsData.filter(gym => {
        const name = currentLang === 'ar' ? gym.name : gym.nameEn;
        const loc = currentLang === 'ar' ? gym.location : gym.locationEn;
        return name.toLowerCase().includes(term) || loc.toLowerCase().includes(term);
    });
    renderGyms(filtered);
});

/* =========================================
   8. تغيير اللغة (Full i18n)
   ========================================= */
window.toggleLanguage = function() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    const htmlTag = document.documentElement;
    
    htmlTag.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    htmlTag.setAttribute('lang', currentLang);
    document.getElementById('lang-btn').innerText = currentLang === 'ar' ? 'EN' : 'AR';

    // ترجمة كل العناصر اللي فيها data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });

    // ترجمة الـ placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });

    // إعادة رندر البيانات عشان الأسماء تتغير
    renderPodium();
    renderGyms();
    
    showToast(currentLang === 'ar' ? 'تم تغيير اللغة' : 'Language changed', 'info');
};

/* =========================================
   9. Firebase Auth (تسجيل الدخول)
   ========================================= */
const provider = new GoogleAuthProvider();

document.getElementById('google-login-btn')?.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // نشوف لو المستخدم موجود في Firestore ولا لأ
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            // المستخدم موجود بالفعل
            currentUser = userDoc.data();
            updateSidebarProfile();
            showToast(currentLang === 'ar' ? `أهلاً بعودتك ${currentUser.name}` : `Welcome back ${currentUser.name}`, 'success');
            showView('home');
        } else {
            // مستخدم جديد، لازم يكمل بياناته
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('profile-section').classList.remove('hidden');
            document.getElementById('reg-email').value = user.email;
        }
    } catch (error) {
        console.error(error);
        showToast(currentLang === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'Login error', 'error');
    }
});

// حفظ بيانات الملف الشخصي في Firestore
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const newUser = {
        uid: auth.currentUser.uid,
        name: document.getElementById('reg-name').value,
        username: document.getElementById('reg-username').value,
        phone: document.getElementById('reg-phone').value,
        gov: document.getElementById('reg-gov').value,
        city: document.getElementById('reg-city').value,
        email: document.getElementById('reg-email').value,
        favorites: []
    };

    try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), newUser);
        currentUser = newUser;
        updateSidebarProfile();
        showToast(currentLang === 'ar' ? 'تم حفظ بياناتك بنجاح!' : 'Profile saved successfully!', 'success');
        showView('home');
    } catch (error) {
        console.error(error);
        showToast('Error saving data', 'error');
    }
});

// مراقبة حالة تسجيل الدخول (لو عمل Refresh)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            currentUser = userDoc.data();
            updateSidebarProfile();
        }
    } else {
        currentUser = null;
        updateSidebarProfile();
    }
});

function updateSidebarProfile() {
    const profileDiv = document.getElementById('sidebar-profile');
    if (!profileDiv) return;

    if (currentUser) {
        document.getElementById('sidebar-avatar').innerText = currentUser.name.charAt(0);
        document.getElementById('sidebar-username').innerText = currentUser.name.split(' ')[0];
        document.getElementById('sidebar-userstatus').innerText = currentLang === 'ar' ? 'عرض الملف الشخصي' : 'View Profile';
        profileDiv.onclick = () => showView('settings');
    } else {
        document.getElementById('sidebar-avatar').innerText = 'U';
        document.getElementById('sidebar-username').innerText = translations[currentLang].login;
        document.getElementById('sidebar-userstatus').innerText = translations[currentLang].click_here;
        profileDiv.onclick = () => showView('login');
    }
}

// تسجيل الخروج
window.logout = async function() {
    try {
        await signOut(auth);
        currentUser = null;
        updateSidebarProfile();
        showToast(currentLang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out', 'info');
        showView('home');
    } catch (error) {
        console.error(error);
    }
};

window.handleProfileClick = function() {
    if (currentUser) showView('settings');
    else showView('login');
};

window.requireLogin = function() {
    if (!currentUser) {
        showToast(currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'error');
        showView('login');
        return false;
    }
    return true;
};

/* =========================================
   10. الإعدادات وإخفاء أفضل 3 جيمات
   ========================================= */
// التحقق من الإعداد المحفوظ عند بدء التشغيل
const hideTop3 = localStorage.getItem('hideTop3') === 'true';
if (hideTop3) {
    document.getElementById('toggle-top3').checked = false;
    document.getElementById('top3-section').style.display = 'none';
}

window.toggleTop3Visibility = function(checkbox) {
    if (checkbox.checked) {
        document.getElementById('top3-section').style.display = 'block';
        localStorage.setItem('hideTop3', 'false');
        showToast(currentLang === 'ar' ? 'تم إظهار قسم أفضل 3' : 'Top 3 shown', 'success');
    } else {
        document.getElementById('top3-section').style.display = 'none';
        localStorage.setItem('hideTop3', 'true');
        showToast(currentLang === 'ar' ? 'تم إخفاء قسم أفضل 3' : 'Top 3 hidden', 'info');
    }
};

/* =========================================
   11. حاسبة السعرات
   ========================================= */
document.getElementById('calorie-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const age = parseInt(document.getElementById('calc-age').value);
    const gender = document.getElementById('calc-gender').value;
    const height = parseFloat(document.getElementById('calc-height').value);
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const activity = parseFloat(document.getElementById('calc-activity').value);
    const goal = document.getElementById('calc-goal').value;

    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
    let tdee = bmr * activity;
    let finalCalories = goal === 'lose' ? tdee - 500 : (goal === 'gain' ? tdee + 500 : tdee);

    const protein = Math.round((finalCalories * 0.30) / 4);
    const carbs = Math.round((finalCalories * 0.40) / 4);
    const fats = Math.round((finalCalories * 0.30) / 9);

    document.getElementById('result-calories').innerText = Math.round(finalCalories);
    document.getElementById('macros-result').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-top: 15px; gap: 10px;">
            <div style="background: var(--bg-card); padding: 10px; border-radius: 10px; flex: 1; border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-muted);">${currentLang === 'ar' ? 'بروتين' : 'Protein'}</div>
                <div style="font-weight: 700; color: #FF4757;">${protein} g</div>
            </div>
            <div style="background: var(--bg-card); padding: 10px; border-radius: 10px; flex: 1; border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-muted);">${currentLang === 'ar' ? 'كارب' : 'Carbs'}</div>
                <div style="font-weight: 700; color: #FFA502;">${carbs} g</div>
            </div>
            <div style="background: var(--bg-card); padding: 10px; border-radius: 10px; flex: 1; border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-muted);">${currentLang === 'ar' ? 'دهون' : 'Fats'}</div>
                <div style="font-weight: 700; color: #2ED573;">${fats} g</div>
            </div>
        </div>
    `;
    document.getElementById('calorie-result').classList.remove('hidden');
});

/* =========================================
   12. المفضلة (حقيقية باستخدام LocalStorage للزوار)
   ========================================= */
let currentFavoriteStatus = false;

window.toggleFavorite = function() {
    if (!requireLogin()) return;
    
    currentFavoriteStatus = !currentFavoriteStatus;
    const favBtn = document.getElementById('fav-btn');
    
    if (currentFavoriteStatus) {
        favBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #FF4757;"></i>';
        showToast(currentLang === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to favorites', 'success');
    } else {
        favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        showToast(currentLang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites', 'info');
    }
};

/* =========================================
   13. الإشعارات (Toast)
   ========================================= */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    
    if (type === 'success') toast.style.backgroundColor = '#2ED573';
    else if (type === 'error') toast.style.backgroundColor = '#FF4757';
    else toast.style.backgroundColor = '#0055FF';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* =========================================
   14. قائمة الموبايل
   ========================================= */
document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

/* =========================================
   15. بدء التشغيل
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    renderPodium();
    renderGyms();
    // بنطبق اللغة الافتراضية
    toggleLanguage(); 
    toggleLanguage(); // بنرجعها عربي تاني عشان نطبق النصوص
});
