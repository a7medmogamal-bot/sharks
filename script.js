/* =========================================================
   SHARKS - Complete Script (All Features)
   ========================================================= */
(function () {
    'use strict';

    /* ============ FIREBASE ============ */
    const firebaseConfig = {
        apiKey: "AIzaSyDzV2fbYR6umCmASccJ36s2AKll8nMJAr8",
        authDomain: "sharks-f91e7.firebaseapp.com",
        projectId: "sharks-f91e7",
        storageBucket: "sharks-f91e7.firebasestorage.app",
        messagingSenderId: "817691988848",
        appId: "1:817691988848:web:31fdb1cf2cd0ac2c8ff5b5",
        measurementId: "G-DJEPG9J1SP"
    };
    let auth = null, db = null, provider = null, storage = null;
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            provider = new firebase.auth.GoogleAuthProvider();
            if (firebase.storage) storage = firebase.storage();
        }
    } catch (e) { console.warn('Firebase not loaded', e); }

    /* ============ STATE ============ */
    let currentLang = 'ar';
    let currentUser = null;
    let currentGymId = null;
    let currentGymData = null;
    let mapInstance = null;
    let mapMarkers = [];
    let compareList = [];
    let reviewPhotos = [];
    let reviewStars = { equipment: 0, cleanliness: 0, location: 0, staff: 0, organization: 0, price: 0 };
    let filters = { area: '', priceMin: 0, priceMax: 1000, ratings: [], services: [], womenHours: false, verified: false };

    /* ============ GYMS DATA ============ */
    const gyms = [
        { id: 'g1', name: 'جولدز جيم', nameEn: "Gold's Gym", area: 'cairo', location: 'القاهرة، مدينة نصر', locationEn: 'Cairo, Nasr City', rating: 4.9, reviews: 320, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop", verified: true, price: '500 EGP', priceNumeric: 500, lat: 30.0626, lng: 31.3300, whatsapp: '201000000001', phone: '01000000001', womenHours: '2:00 PM - 5:00 PM', womenHoursAr: '2:00 م - 5:00 م', services: ['gym','cardio','boxing','sauna'], hours: { sat:'6:00-24:00', sun:'6:00-24:00', mon:'6:00-24:00', tue:'6:00-24:00', wed:'6:00-24:00', thu:'6:00-24:00', fri:'10:00-20:00' } },
        { id: 'g2', name: 'فيتنس فيرست', nameEn: 'Fitness First', area: 'giza', location: 'الجيزة، المهندسين', locationEn: 'Giza, Mohandessin', rating: 4.7, reviews: 210, image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=600&auto=format&fit=crop", verified: true, price: '600 EGP', priceNumeric: 600, lat: 30.0561, lng: 31.2009, whatsapp: '201000000002', phone: '01000000002', womenHours: '12:00 PM - 4:00 PM', womenHoursAr: '12:00 م - 4:00 م', services: ['gym','cardio','yoga','pool','sauna'], hours: { sat:'7:00-23:00', sun:'7:00-23:00', mon:'7:00-23:00', tue:'7:00-23:00', wed:'7:00-23:00', thu:'7:00-23:00', fri:'9:00-21:00' } },
        { id: 'g3', name: 'ماي جيم', nameEn: 'My Gym', area: 'alex', location: 'الإسكندرية، سموحة', locationEn: 'Alexandria, Smouha', rating: 4.5, reviews: 150, image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600&auto=format&fit=crop", verified: false, price: '400 EGP', priceNumeric: 400, lat: 31.2057, lng: 29.9553, whatsapp: '201000000003', phone: '01000000003', womenHours: '', womenHoursAr: '', services: ['gym','cardio'], hours: { sat:'8:00-22:00', sun:'8:00-22:00', mon:'8:00-22:00', tue:'8:00-22:00', wed:'8:00-22:00', thu:'8:00-22:00', fri:'10:00-18:00' } },
        { id: 'g4', name: 'جيم بلس', nameEn: 'Gym Plus', area: 'cairo', location: 'القاهرة، المعادي', locationEn: 'Cairo, Maadi', rating: 4.2, reviews: 85, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop", verified: false, price: '350 EGP', priceNumeric: 350, lat: 29.9602, lng: 31.2569, whatsapp: '201000000004', phone: '01000000004', womenHours: '3:00 PM - 6:00 PM', womenHoursAr: '3:00 م - 6:00 م', services: ['gym','cardio','yoga'], hours: { sat:'6:00-23:00', sun:'6:00-23:00', mon:'6:00-23:00', tue:'6:00-23:00', wed:'6:00-23:00', thu:'6:00-23:00', fri:'10:00-20:00' } },
        { id: 'g5', name: 'أوليمبيا جيم', nameEn: 'Olympia Gym', area: 'cairo', location: 'القاهرة، مصر الجديدة', locationEn: 'Cairo, Heliopolis', rating: 4.6, reviews: 112, image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", verified: true, price: '450 EGP', priceNumeric: 450, lat: 30.0910, lng: 31.3400, whatsapp: '201000000005', phone: '01000000005', womenHours: '', womenHoursAr: '', services: ['gym','cardio','boxing'], hours: { sat:'6:00-24:00', sun:'6:00-24:00', mon:'6:00-24:00', tue:'6:00-24:00', wed:'6:00-24:00', thu:'6:00-24:00', fri:'10:00-20:00' } },
        { id: 'g6', name: 'بلاتينيوم جيم', nameEn: 'Platinum Gym', area: 'giza', location: 'الجيزة، الدقي', locationEn: 'Giza, Dokki', rating: 4.8, reviews: 245, image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop", verified: true, price: '750 EGP', priceNumeric: 750, lat: 30.0385, lng: 31.2106, whatsapp: '201000000006', phone: '01000000006', womenHours: '1:00 PM - 4:00 PM', womenHoursAr: '1:00 م - 4:00 م', services: ['gym','cardio','yoga','pool','sauna','boxing'], hours: { sat:'6:00-24:00', sun:'6:00-24:00', mon:'6:00-24:00', tue:'6:00-24:00', wed:'6:00-24:00', thu:'6:00-24:00', fri:'8:00-22:00' } }
    ];

    /* ============ TRANSLATIONS ============ */
    const T = {
        ar: {
            nav_home:'الرئيسية', nav_map:'الخريطة', nav_calories:'السعرات الحرارية', nav_favorites:'المفضلة', nav_top10:'أفضل 10 جيمات', nav_messages:'الرسائل', nav_ai:'SHARKS AI', nav_store:'المتجر', nav_coaches:'المدربون', nav_about:'حول', nav_who:'من نحن', nav_settings:'الإعدادات',
            login:'تسجيل الدخول', click_here:'اضغط هنا', search_placeholder:'ابحث عن جيم، منطقة، أو ميزة...',
            top3_title:'أفضل 3 جيمات هذا الشهر', nearby_title:'الجيمات الأقرب إليك', all_gyms_title:'كل الجيمات', view_all:'عرض الكل', view_map:'الخريطة', view_list:'عرض القائمة', map_title:'خريطة الجيمات',
            rank1:'المركز الأول', rank2:'المركز الثاني', rank3:'المركز الثالث', details:'التفاصيل',
            login_title:'مرحباً بك في SHARKS', login_subtitle:'اكتشف أفضل الجيمات في مصر، قيم تجربتك، وتابع أهدافك.', login_google:'تسجيل الدخول باستخدام Google',
            profile_title:'استكمال الملف الشخصي', profile_subtitle:'محتاجين شوية بيانات عشان نكمل معاك.', full_name:'الاسم الرباعي', username:'اسم المستخدم', phone:'رقم الهاتف', governorate:'المحافظة', city:'المركز / المنطقة', email:'البريد الإلكتروني', save_continue:'حفظ ومتابعة',
            cairo:'القاهرة', giza:'الجيزة', alex:'الإسكندرية',
            back:'رجوع', call:'اتصال', whatsapp:'واتساب', map:'الموقع',
            reviews_title:'التقييمات', rate_experience:'قيم تجربتك', login_to_rate:'يجب تسجيل الدخول لتتمكن من التقييم.', add_review:'أضف تقييمك',
            extra_info:'معلومات إضافية', price:'الأسعار:', last_update:'آخر تحديث:', status:'الحالة:', verified:'موثّق', not_verified:'غير موثّق', report:'الإبلاغ عن بيانات خاطئة',
            working_hours:'مواعيد العمل', women_hours:'مواعيد السيدات',
            day_sat:'السبت', day_sun:'الأحد', day_mon:'الإثنين', day_tue:'الثلاثاء', day_wed:'الأربعاء', day_thu:'الخميس', day_fri:'الجمعة',
            crit_equipment:'الأجهزة والمعدات', crit_cleanliness:'النظافة', crit_location:'المكان والموقع', crit_staff:'التعامل وخدمة العملاء', crit_organization:'النظام والتنظيم', crit_price:'السعر',
            rate_title:'قيم تجربتك', add_photos:'أضف صور (اختياري)', photo_hint:'اضغط لرفع صور من جهازك', photo_limit:'بحد أقصى 3 صور', cancel:'إلغاء', submit:'إرسال التقييم',
            messages_title:'الرسائل', msg_welcome_title:'أهلاً بك في SHARKS', msg_welcome_body:'شكراً لانضمامك إلينا. ابدأ باكتشاف الجيمات القريبة منك.', msg_time_2h:'منذ ساعتين', msg_winner_title:'إعلان الفائزين الشهريين', msg_winner_body:'تم إعلان أفضل 3 جيمات لهذا الشهر.', msg_time_1d:'منذ يوم',
            calories_title:'حاسبة السعرات الحرارية', age:'العمر', gender:'الجنس', male:'ذكر', female:'أنثى', height:'الطول (سم)', weight:'الوزن (كجم)', activity:'مستوى النشاط', sedentary:'قليل الحركة', light:'نشاط خفيف', moderate:'نشاط متوسط', active:'نشاط عالي', goal:'الهدف', lose:'خفض الدهون', maintain:'المحافظة على الوزن', gain:'بناء العضلات', calculate:'احسب', daily_need:'احتياجك اليومي:', calories_unit:'سعرة حرارية',
            favorites_title:'المفضلة', no_favorites:'لا توجد جيمات في المفضلة حالياً.', top10_title:'أفضل 10 جيمات',
            settings_title:'الإعدادات', account_settings:'الحساب', edit_profile:'تعديل البيانات الشخصية', notifications:'تفضيلات الإشعارات', location_permission:'إذن الموقع', display_settings:'العرض', show_top3:'إظهار قسم أفضل 3 جيمات', about_platform:'عن المنصة', logout:'تسجيل الخروج',
            about_title:'حول SHARKS', how_to_use:'كيفية استخدام المنصة', about_step1:'1. ابحث عن الجيمات في منطقتك.', about_step2:'2. تصفح التفاصيل والأسعار.', about_step3:'3. قيم الجيم على 6 معايير.', about_step4:'4. استخدم حاسبة السعرات.', monthly_system:'آلية التقييم الشهرية', monthly_desc:'يتم احتساب التقييمات كل شهر.',
            who_title:'من نحن', vision:'رؤيتنا', vision_desc:'المنصة الأولى لاكتشاف الجيمات في مصر.', mission:'رسالتنا', mission_desc:'بيانات دقيقة وشفافة.', contact:'تواصل معنا',
            filters:'الفلاتر', filter_area:'المنطقة', all_areas:'كل المناطق', filter_price:'نطاق السعر (جنيه)', filter_rating:'التقييم', stars:'نجوم', filter_services:'الخدمات', service_gym:'صالة حديد', service_cardio:'كارديو', service_boxing:'ملاكمة', service_yoga:'يوغا', service_pool:'مسبح', service_sauna:'ساونا', filter_extra:'خيارات إضافية', filter_women:'مواعيد سيدات', filter_verified:'موثّق فقط', apply_filters:'تطبيق الفلاتر', clear_all:'مسح الكل',
            compare_selected:'جيم مختار', compare_now:'قارن الآن', compare_title:'مقارنة الجيمات', compare_criteria:'المعيار', compare_name:'الجيم', compare_location:'الموقع', compare_rating:'التقييم', compare_reviews:'عدد التقييمات', compare_price:'السعر', compare_verified:'موثّق', compare_services:'الخدمات', compare_women:'مواعيد السيدات',
            lang_changed:'تم تغيير اللغة', welcome_back:'مرحباً بعودتك', save_profile:'تم حفظ بياناتك بنجاح!', logout_success:'تم تسجيل الخروج', must_login:'يجب تسجيل الدخول أولاً', added_fav:'تمت الإضافة للمفضلة', removed_fav:'تمت الإزالة من المفضلة', top3_shown:'تم إظهار قسم أفضل 3', top3_hidden:'تم إخفاء قسم أفضل 3', login_error:'فشل تسجيل الدخول', review_success:'تم إرسال تقييمك! شكراً لك', filters_applied:'تم تطبيق الفلاتر', filters_cleared:'تم مسح الفلاتر', max_compare:'الحد الأقصى 3 جيمات', min_compare:'اختر جيمين على الأقل', result_count:'نتيجة'
        },
        en: {
            nav_home:'Home', nav_map:'Map', nav_calories:'Calories', nav_favorites:'Favorites', nav_top10:'Top 10 Gyms', nav_messages:'Messages', nav_ai:'SHARKS AI', nav_store:'Store', nav_coaches:'Coaches', nav_about:'About', nav_who:'Who We Are', nav_settings:'Settings',
            login:'Login', click_here:'Click here', search_placeholder:'Search for a gym, area, or feature...',
            top3_title:'Top 3 Gyms This Month', nearby_title:'Nearby Gyms', all_gyms_title:'All Gyms', view_all:'View All', view_map:'Map', view_list:'View List', map_title:'Gyms Map',
            rank1:'1st Place', rank2:'2nd Place', rank3:'3rd Place', details:'Details',
            login_title:'Welcome to SHARKS', login_subtitle:'Discover the best gyms in Egypt, rate your experience.', login_google:'Sign in with Google',
            profile_title:'Complete Profile', profile_subtitle:'We need some data to continue.', full_name:'Full Name', username:'Username', phone:'Phone', governorate:'Governorate', city:'City / Area', email:'Email', save_continue:'Save & Continue',
            cairo:'Cairo', giza:'Giza', alex:'Alexandria',
            back:'Back', call:'Call', whatsapp:'WhatsApp', map:'Location',
            reviews_title:'Reviews', rate_experience:'Rate your experience', login_to_rate:'You must login to rate.', add_review:'Add Review',
            extra_info:'Extra Info', price:'Price:', last_update:'Last Update:', status:'Status:', verified:'Verified', not_verified:'Not Verified', report:'Report wrong data',
            working_hours:'Working Hours', women_hours:'Women Hours',
            day_sat:'Sat', day_sun:'Sun', day_mon:'Mon', day_tue:'Tue', day_wed:'Wed', day_thu:'Thu', day_fri:'Fri',
            crit_equipment:'Equipment', crit_cleanliness:'Cleanliness', crit_location:'Location', crit_staff:'Staff & Service', crit_organization:'Organization', crit_price:'Price',
            rate_title:'Rate your experience', add_photos:'Add photos (optional)', photo_hint:'Click to upload from device', photo_limit:'Max 3 photos', cancel:'Cancel', submit:'Submit Review',
            messages_title:'Messages', msg_welcome_title:'Welcome to SHARKS', msg_welcome_body:'Thanks for joining. Start discovering nearby gyms.', msg_time_2h:'2 hours ago', msg_winner_title:'Monthly Winners Announced', msg_winner_body:'Top 3 gyms this month announced.', msg_time_1d:'1 day ago',
            calories_title:'Calorie Calculator', age:'Age', gender:'Gender', male:'Male', female:'Female', height:'Height (cm)', weight:'Weight (kg)', activity:'Activity Level', sedentary:'Sedentary', light:'Light', moderate:'Moderate', active:'Active', goal:'Goal', lose:'Lose Fat', maintain:'Maintain', gain:'Build Muscle', calculate:'Calculate', daily_need:'Daily Need:', calories_unit:'Calories',
            favorites_title:'Favorites', no_favorites:'No favorite gyms yet.', top10_title:'Top 10 Gyms',
            settings_title:'Settings', account_settings:'Account', edit_profile:'Edit Profile', notifications:'Notifications', location_permission:'Location', display_settings:'Display', show_top3:'Show Top 3 Section', about_platform:'About', logout:'Logout',
            about_title:'About SHARKS', how_to_use:'How to use', about_step1:'1. Search for gyms in your area.', about_step2:'2. Browse details and prices.', about_step3:'3. Rate on 6 criteria.', about_step4:'4. Use calorie calculator.', monthly_system:'Monthly Rating', monthly_desc:'Ratings calculated monthly.',
            who_title:'Who We Are', vision:'Our Vision', vision_desc:"Egypt's #1 gym platform.", mission:'Our Mission', mission_desc:'Accurate transparent data.', contact:'Contact',
            filters:'Filters', filter_area:'Area', all_areas:'All Areas', filter_price:'Price Range (EGP)', filter_rating:'Rating', stars:'stars', filter_services:'Services', service_gym:'Gym', service_cardio:'Cardio', service_boxing:'Boxing', service_yoga:'Yoga', service_pool:'Pool', service_sauna:'Sauna', filter_extra:'More Options', filter_women:'Women Hours', filter_verified:'Verified Only', apply_filters:'Apply Filters', clear_all:'Clear All',
            compare_selected:'gyms selected', compare_now:'Compare Now', compare_title:'Compare Gyms', compare_criteria:'Criteria', compare_name:'Gym', compare_location:'Location', compare_rating:'Rating', compare_reviews:'Reviews', compare_price:'Price', compare_verified:'Verified', compare_services:'Services', compare_women:'Women Hours',
            lang_changed:'Language changed', welcome_back:'Welcome back', save_profile:'Profile saved!', logout_success:'Logged out', must_login:'Please login first', added_fav:'Added to favorites', removed_fav:'Removed from favorites', top3_shown:'Top 3 shown', top3_hidden:'Top 3 hidden', login_error:'Login failed', review_success:'Review submitted! Thanks', filters_applied:'Filters applied', filters_cleared:'Filters cleared', max_compare:'Max 3 gyms', min_compare:'Select at least 2 gyms', result_count:'results'
        }
    };
    const tr = (key) => (T[currentLang] && T[currentLang][key]) || key;

    /* ============ UTILITIES ============ */
    function showToast(msg, type) {
        type = type || 'info';
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

    function animateNumber(el, target, duration = 1200) {
        if (!el) return;
        const startTime = performance.now();
        function update(t) {
            const elapsed = t - startTime;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function showSkeletons() {
        document.querySelectorAll('#view-home .gyms-grid, .podium-container').forEach(grid => {
            const count = grid.classList.contains('podium-container') ? 3 : 4;
            grid.innerHTML = Array(count).fill(0).map(() => '<div class="skeleton-card"></div>').join('');
        });
    }

    /* ============ VIEW SWITCH ============ */
    window.showView = function(viewId) {
        document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
        const target = document.getElementById('view-' + viewId);
        if (target) {
            target.classList.remove('hidden');
            target.style.animation = 'none';
            void target.offsetHeight;
            target.style.animation = '';
        }
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (activeLink) activeLink.classList.add('active');
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.remove('open');
        window.scrollTo(0, 0);

        if (viewId === 'favorites') renderFavorites();
        if (viewId === 'top10') renderTop10();
        if (viewId === 'map') initMap();
        if (viewId === 'messages') renderMessages();
    };

    /* ============ RENDER: TOP 3 ============ */
    function renderTop3() {
        const container = document.getElementById('podium-container');
        if (!container) return;
        const sorted = [...gyms].sort((a, b) => b.rating - a.rating).slice(0, 3);
        const card = (g, rank) => `
            <div class="podium-item podium-${rank}">
                <div class="gym-card podium-card" onclick="window.openGymDetails('${g.id}')">
                    <div class="badge"><i class="fa-solid fa-trophy"></i> ${tr('rank' + rank)}</div>
                    <div class="card-image" style="background-image:url('${g.image}')"></div>
                    <div class="card-content">
                        <div class="card-title-row">
                            <div class="card-title">${currentLang === 'ar' ? g.name : g.nameEn}</div>
                            ${g.verified ? '<i class="fa-solid fa-circle-check verified-icon"></i>' : ''}
                        </div>
                        <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${currentLang === 'ar' ? g.location : g.locationEn}</div>
                        <div class="card-footer">
                            <div class="rating"><i class="fa-solid fa-star"></i> ${g.rating} <span>(${g.reviews})</span></div>
                            <button class="btn-primary" onclick="event.stopPropagation();window.openGymDetails('${g.id}')">${tr('details')}</button>
                        </div>
                    </div>
                </div>
            </div>`;
        container.innerHTML = card(sorted[1], 2) + card(sorted[0], 1) + card(sorted[2], 3);
    }

    /* ============ RENDER: GYM CARD ============ */
    function gymCardHTML(g) {
        const isSelected = compareList.includes(g.id);
        return `
            <div class="gym-card" onclick="window.openGymDetails('${g.id}')">
                <div class="compare-checkbox ${isSelected ? 'selected' : ''}" onclick="toggleCompare('${g.id}', event)">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div class="card-image" style="background-image:url('${g.image}')"></div>
                <div class="card-content">
                    <div class="card-title-row">
                        <div class="card-title">${currentLang === 'ar' ? g.name : g.nameEn}</div>
                        ${g.verified ? '<i class="fa-solid fa-circle-check verified-icon"></i>' : ''}
                    </div>
                    <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${currentLang === 'ar' ? g.location : g.locationEn}</div>
                    <div class="card-footer">
                        <div class="rating"><i class="fa-solid fa-star"></i> ${g.rating} <span>(${g.reviews})</span></div>
                        <button class="btn-primary" onclick="event.stopPropagation();window.openGymDetails('${g.id}')">${tr('details')}</button>
                    </div>
                </div>
            </div>`;
    }

    function renderFilteredGyms() {
        const filtered = getFilteredGyms();
        const allGrid = document.getElementById('all-gyms-grid');
        const nearbyGrid = document.getElementById('nearby-gyms-grid');
        const count = document.getElementById('results-count');
        if (allGrid) allGrid.innerHTML = filtered.length ? filtered.map(gymCardHTML).join('') : `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:20px;">${currentLang === 'ar' ? 'لا توجد نتائج' : 'No results'}</p>`;
        if (nearbyGrid) nearbyGrid.innerHTML = filtered.slice(0, 2).map(gymCardHTML).join('');
        if (count) count.textContent = `${filtered.length} ${tr('result_count')}`;
        setupCardTilt();
        setupMagneticButtons();
    }

    /* ============ FILTERS ============ */
    window.toggleFilters = function() {
        const panel = document.getElementById('filter-panel');
        const overlay = document.getElementById('filter-overlay');
        panel.classList.toggle('open');
        overlay.classList.toggle('active', panel.classList.contains('open'));
    };

    function getFilteredGyms() {
        return gyms.filter(g => {
            if (filters.area && g.area !== filters.area) return false;
            if (g.priceNumeric < filters.priceMin || g.priceNumeric > filters.priceMax) return false;
            if (filters.ratings.length > 0) {
                const minR = Math.min(...filters.ratings);
                if (g.rating < minR) return false;
            }
            if (filters.services.length > 0 && !filters.services.every(s => g.services.includes(s))) return false;
            if (filters.womenHours && !g.womenHours) return false;
            if (filters.verified && !g.verified) return false;
            return true;
        });
    }

    window.applyFilters = function() {
        filters.area = document.getElementById('filter-area').value;
        filters.priceMin = parseInt(document.getElementById('filter-price-min').value);
        filters.priceMax = parseInt(document.getElementById('filter-price-max').value);
        filters.ratings = Array.from(document.querySelectorAll('.filter-rating:checked')).map(e => parseFloat(e.value));
        filters.services = Array.from(document.querySelectorAll('.filter-service:checked')).map(e => e.value);
        filters.womenHours = document.getElementById('filter-women-hours').checked;
        filters.verified = document.getElementById('filter-verified').checked;
        renderFilteredGyms();
        toggleFilters();
        showToast(tr('filters_applied'), 'success');
    };

    window.clearFilters = function() {
        document.getElementById('filter-area').value = '';
        document.getElementById('filter-price-min').value = 0;
        document.getElementById('filter-price-max').value = 1000;
        document.getElementById('price-min-display').textContent = '0';
        document.getElementById('price-max-display').textContent = '1000';
        document.querySelectorAll('.filter-rating, .filter-service').forEach(el => el.checked = false);
        document.getElementById('filter-women-hours').checked = false;
        document.getElementById('filter-verified').checked = false;
        filters = { area:'', priceMin:0, priceMax:1000, ratings:[], services:[], womenHours:false, verified:false };
        renderFilteredGyms();
        showToast(tr('filters_cleared'), 'info');
    };

    /* ============ COMPARE ============ */
    window.toggleCompare = function(gymId, e) {
        if (e) e.stopPropagation();
        const idx = compareList.indexOf(gymId);
        if (idx > -1) compareList.splice(idx, 1);
        else {
            if (compareList.length >= 3) { showToast(tr('max_compare'), 'error'); return; }
            compareList.push(gymId);
        }
        renderCompareBar();
        document.querySelectorAll('.gym-card').forEach(card => {
            const cb = card.querySelector('.compare-checkbox');
            if (!cb) return;
            const onclickAttr = cb.getAttribute('onclick') || '';
            const match = onclickAttr.match(/toggleCompare\('([^']+)'/);
            if (match && match[1] === gymId) cb.classList.toggle('selected', compareList.includes(gymId));
        });
    };

    function renderCompareBar() {
        const bar = document.getElementById('compare-bar');
        if (!bar) return;
        if (compareList.length === 0) { bar.classList.add('hidden'); return; }
        bar.classList.remove('hidden');
        document.getElementById('compare-count').textContent = compareList.length;
        const slots = document.getElementById('compare-slots');
        let html = '';
        compareList.forEach(id => {
            const g = gyms.find(x => x.id === id);
            if (g) html += `<div class="compare-slot" style="background-image:url('${g.image}')"><button class="remove-slot" onclick="toggleCompare('${id}', event)"><i class="fa-solid fa-xmark"></i></button></div>`;
        });
        for (let i = compareList.length; i < 3; i++) html += '<div class="compare-slot empty"><i class="fa-solid fa-plus"></i></div>';
        slots.innerHTML = html;
    }

    window.clearCompare = function() {
        compareList = [];
        renderCompareBar();
        document.querySelectorAll('.compare-checkbox').forEach(c => c.classList.remove('selected'));
    };

    window.openCompareModal = function() {
        if (compareList.length < 2) { showToast(tr('min_compare'), 'error'); return; }
        const selected = compareList.map(id => gyms.find(g => g.id === id)).filter(Boolean);
        const rows = [
            { label: tr('compare_name'), render: g => `<div class="compare-img" style="background-image:url('${g.image}')"></div><div class="compare-name">${currentLang === 'ar' ? g.name : g.nameEn}</div>` },
            { label: tr('compare_location'), render: g => currentLang === 'ar' ? g.location : g.locationEn },
            { label: tr('compare_rating'), render: g => `<span class="rating-value">⭐ ${g.rating}</span>`, best: g => g.rating },
            { label: tr('compare_reviews'), render: g => g.reviews, best: g => g.reviews },
            { label: tr('compare_price'), render: g => g.price, best: g => -g.priceNumeric },
            { label: tr('compare_verified'), render: g => g.verified ? '<span style="color:var(--primary-blue);">✔</span>' : '<span style="color:var(--text-muted);">✘</span>', best: g => g.verified ? 1 : 0 },
            { label: tr('compare_services'), render: g => g.services.map(s => tr('service_' + s)).join(', ') },
            { label: tr('compare_women'), render: g => (currentLang === 'ar' ? g.womenHoursAr : g.womenHours) || '—' }
        ];
        let html = '<table class="compare-table"><thead><tr><th>' + tr('compare_criteria') + '</th>';
        selected.forEach(g => html += `<th>${currentLang === 'ar' ? g.name : g.nameEn}</th>`);
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += `<tr><td>${row.label}</td>`;
            let bestVal = null;
            if (row.best) bestVal = Math.max(...selected.map(g => row.best(g)));
            selected.forEach(g => {
                const isBest = row.best && row.best(g) === bestVal;
                html += `<td class="${isBest ? 'winner' : ''}">${row.render(g)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        document.getElementById('compare-table-container').innerHTML = html;
        document.getElementById('compare-modal').classList.remove('hidden');
    };

    window.closeCompareModal = function() {
        document.getElementById('compare-modal').classList.add('hidden');
    };

    /* ============ MAP ============ */
    function initMap() {
        if (typeof L === 'undefined') return;
        if (mapInstance) {
            setTimeout(() => { mapInstance.invalidateSize(); updateMapMarkers(); }, 150);
            return;
        }
        const container = document.getElementById('gyms-map');
        if (!container) return;
        mapInstance = L.map('gyms-map').setView([30.0444, 31.2357], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap', maxZoom: 19
        }).addTo(mapInstance);
        updateMapMarkers();
    }

    function updateMapMarkers() {
        if (!mapInstance) return;
        mapMarkers.forEach(m => mapInstance.removeLayer(m));
        mapMarkers = [];
        const filtered = getFilteredGyms();
        filtered.forEach(gym => {
            const marker = L.marker([gym.lat, gym.lng], {
                icon: L.divIcon({
                    className: 'custom-marker-wrapper',
                    html: '<div class="custom-map-marker"></div>',
                    iconSize: [30, 30], iconAnchor: [15, 30]
                })
            }).addTo(mapInstance);
            const popupHTML = `
                <div style="min-width:180px;">
                    <b style="color:var(--primary-blue);">${currentLang === 'ar' ? gym.name : gym.nameEn}</b><br>
                    <small>${currentLang === 'ar' ? gym.location : gym.locationEn}</small><br>
                    <span style="color:#FFD700;font-weight:700;">⭐ ${gym.rating}</span> • ${gym.price}<br>
                    <button onclick="window.openGymDetails('${gym.id}')" style="margin-top:8px;background:#0055FF;color:white;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;font-family:Cairo;font-weight:600;">${tr('details')}</button>
                </div>`;
            marker.bindPopup(popupHTML);
            mapMarkers.push(marker);
        });
        if (filtered.length > 0) {
            const bounds = L.latLngBounds(filtered.map(g => [g.lat, g.lng]));
            mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
    }

    /* ============ OPEN GYM DETAILS ============ */
    window.openGymDetails = function(gymId) {
        const g = gyms.find(x => x.id === gymId);
        if (!g) return;
        currentGymId = gymId;
        currentGymData = g;
        document.getElementById('details-cover').style.backgroundImage = `url('${g.image}')`;
        const vIcon = g.verified ? ' <i class="fa-solid fa-circle-check verified-icon"></i>' : '';
        document.getElementById('details-title').innerHTML = `${currentLang === 'ar' ? g.name : g.nameEn}${vIcon}`;
        document.getElementById('details-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${currentLang === 'ar' ? g.location : g.locationEn}`;
        document.getElementById('details-price').textContent = g.price;
        document.getElementById('details-update').textContent = '15 Oct 2026';
        document.getElementById('details-verified').innerHTML = g.verified
            ? `${tr('verified')} <i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>`
            : tr('not_verified');
        document.getElementById('details-review-count').textContent = `(${g.reviews})`;
        const favBtn = document.getElementById('fav-btn');
        const isFav = getFavorites().includes(gymId);
        favBtn.innerHTML = `<i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" ${isFav ? 'style="color:#FF4757;"' : ''}></i>`;
        document.getElementById('whatsapp-btn').href = `https://wa.me/${g.whatsapp}?text=${encodeURIComponent(currentLang === 'ar' ? 'أهلاً، أنا جاي من SHARKS وعايز أعرف أسعار الاشتراك.' : 'Hi, I came from SHARKS and would like to know the subscription prices.')}`;
        renderCriteria();
        renderHours(g);
        showView('details');
        animateProgressBars();
    };

    function renderCriteria() {
        const criteria = [
            { label: tr('crit_equipment'), val: 4.5 },
            { label: tr('crit_cleanliness'), val: 4.0 },
            { label: tr('crit_location'), val: 4.8 },
            { label: tr('crit_staff'), val: 4.3 },
            { label: tr('crit_organization'), val: 4.4 },
            { label: tr('crit_price'), val: 3.5 }
        ];
        document.getElementById('rating-criteria').innerHTML = criteria.map(c => `
            <div class="criteria-row">
                <span>${c.label}</span>
                <div class="progress-bar"><div class="progress" style="width:0%" data-target="${(c.val/5)*100}%"></div></div>
                <span>${c.val}</span>
            </div>`).join('');
    }

    function animateProgressBars() {
        setTimeout(() => {
            document.querySelectorAll('#view-details .progress').forEach((bar, i) => {
                setTimeout(() => { bar.style.width = bar.dataset.target; }, i * 90);
            });
        }, 200);
    }

    function renderHours(g) {
        const days = ['sat','sun','mon','tue','wed','thu','fri'];
        const table = document.querySelector('#view-details .hours-table');
        if (table) table.innerHTML = days.map(d => `<tr><td>${tr('day_' + d)}</td><td>${g.hours[d]}</td></tr>`).join('');
        const women = g.womenHours ? `
            <div class="women-hours-card">
                <h4><i class="fa-solid fa-female"></i> ${tr('women_hours')}</h4>
                <p>${currentLang === 'ar' ? g.womenHoursAr : g.womenHours}</p>
            </div>` : '';
        const womenContainer = document.querySelector('#view-details .info-card:first-child');
        if (womenContainer) {
            const existing = womenContainer.querySelector('.women-hours-card');
            if (existing) existing.remove();
            if (women) womenContainer.insertAdjacentHTML('beforeend', women);
        }
    }

    /* ============ SEARCH ============ */
    function setupSearch() {
        const input = document.getElementById('global-search');
        if (!input) return;
        input.addEventListener('input', function() {
            const term = this.value.toLowerCase().trim();
            document.querySelectorAll('#view-home .gym-card').forEach(card => {
                const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
                const loc = (card.querySelector('.card-location')?.textContent || '').toLowerCase();
                const match = !term || title.includes(term) || loc.includes(term);
                if (match) { card.style.display = ''; card.classList.remove('hide-anim'); }
                else { card.classList.add('hide-anim'); setTimeout(() => { if (card.classList.contains('hide-anim')) card.style.display = 'none'; }, 280); }
            });
        });
    }

    /* ============ CALCULATOR ============ */
    function setupCalculator() {
        const form = document.getElementById('calorie-form');
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const age = parseInt(document.getElementById('calc-age').value) || 0;
            const gender = document.getElementById('calc-gender').value;
            const height = parseFloat(document.getElementById('calc-height').value) || 0;
            const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
            const activity = parseFloat(document.getElementById('calc-activity').value) || 1.2;
            const goal = document.getElementById('calc-goal').value;
            if (!age || !height || !weight) { showToast('أدخل كل البيانات', 'error'); return; }
            const bmr = (10*weight) + (6.25*height) - (5*age) + (gender === 'male' ? 5 : -161);
            let tdee = bmr * activity;
            if (goal === 'lose') tdee -= 500;
            if (goal === 'gain') tdee += 500;
            const protein = Math.round((tdee*0.30)/4);
            const carbs = Math.round((tdee*0.40)/4);
            const fats = Math.round((tdee*0.30)/9);
            animateNumber(document.getElementById('result-calories'), Math.round(tdee));
            document.getElementById('macros-result').innerHTML = `
                <div style="display:flex;justify-content:space-between;gap:10px;margin-top:15px;">
                    <div style="flex:1;background:var(--bg-card);padding:10px;border-radius:10px;border:1px solid var(--border-color);"><div style="font-size:12px;color:var(--text-muted);">${currentLang==='ar'?'بروتين':'Protein'}</div><div style="font-weight:700;color:#FF4757;">${protein} g</div></div>
                    <div style="flex:1;background:var(--bg-card);padding:10px;border-radius:10px;border:1px solid var(--border-color);"><div style="font-size:12px;color:var(--text-muted);">${currentLang==='ar'?'كارب':'Carbs'}</div><div style="font-weight:700;color:#FFA502;">${carbs} g</div></div>
                    <div style="flex:1;background:var(--bg-card);padding:10px;border-radius:10px;border:1px solid var(--border-color);"><div style="font-size:12px;color:var(--text-muted);">${currentLang==='ar'?'دهون':'Fats'}</div><div style="font-weight:700;color:#2ED573;">${fats} g</div></div>
                </div>`;
            document.getElementById('calorie-result').classList.remove('hidden');
        });
    }

    /* ============ FAVORITES ============ */
    function getFavorites() {
        try { return JSON.parse(localStorage.getItem('sharks_favs_' + (currentUser?.uid || 'guest')) || '[]'); }
        catch(e) { return []; }
    }
    function saveFavorites(f) { localStorage.setItem('sharks_favs_' + (currentUser?.uid || 'guest'), JSON.stringify(f)); }

    window.toggleFavorite = function(e) {
        if (e) e.stopPropagation();
        if (!currentUser) { showToast(tr('must_login'), 'error'); showView('login'); return; }
        const gymId = currentGymId;
        if (!gymId) return;
        let favs = getFavorites();
        const icon = document.querySelector('#fav-btn i');
        const btn = document.getElementById('fav-btn');
        if (favs.includes(gymId)) {
            favs = favs.filter(id => id !== gymId);
            icon.className = 'fa-regular fa-heart';
            icon.style.color = '';
            showToast(tr('removed_fav'), 'info');
        } else {
            favs.push(gymId);
            icon.className = 'fa-solid fa-heart';
            icon.style.color = '#FF4757';
            icon.classList.remove('heart-animate');
            void icon.offsetWidth;
            icon.classList.add('heart-animate');
            spawnFloatingHearts(btn);
            showToast(tr('added_fav'), 'success');
        }
        saveFavorites(favs);
        if (db && currentUser) db.collection('users').doc(currentUser.uid).update({ favorites: favs }).catch(() => {});
    };

    function spawnFloatingHearts(btn) {
        if (!btn) return;
        for (let i = 0; i < 6; i++) {
            const h = document.createElement('span');
            h.className = 'floating-heart';
            h.textContent = '❤';
            h.style.setProperty('--tx', (Math.random()*90-45) + 'px');
            h.style.setProperty('--ty', (-Math.random()*70-30) + 'px');
            h.style.animationDelay = (i*40) + 'ms';
            btn.appendChild(h);
            setTimeout(() => h.remove(), 1300);
        }
    }

    function renderFavorites() {
        const grid = document.getElementById('favorites-grid');
        if (!grid) return;
        const favs = getFavorites();
        if (favs.length === 0) {
            grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;">${tr('no_favorites')}</p>`;
            return;
        }
        grid.innerHTML = favs.map(id => { const g = gyms.find(x => x.id === id); return g ? gymCardHTML(g) : ''; }).join('');
        setupCardTilt();
    }

    /* ============ MESSAGES / TOP10 ============ */
    function renderMessages() { /* static in HTML, translated by data-i18n */ }

    function renderTop10() {
        const list = document.getElementById('top10-list');
        if (!list) return;
        const sorted = [...gyms].sort((a,b) => b.rating - a.rating).slice(0, 10);
        list.innerHTML = sorted.map((g, i) => `
            <div class="list-item" onclick="window.openGymDetails('${g.id}')">
                <span class="rank">${i+1}</span>
                <div class="list-img" style="background-image:url('${g.image}')"></div>
                <div class="list-info"><h3>${currentLang==='ar'?g.name:g.nameEn}</h3><p>${currentLang==='ar'?g.location:g.locationEn}</p></div>
                <div class="rating"><i class="fa-solid fa-star"></i> ${g.rating}</div>
            </div>`).join('');
    }

    /* ============ REVIEW MODAL ============ */
    window.openReviewModal = function() {
        if (!currentUser) { showToast(tr('must_login'), 'error'); showView('login'); return; }
        reviewStars = { equipment:0, cleanliness:0, location:0, staff:0, organization:0, price:0 };
        reviewPhotos = [];
        document.querySelectorAll('#review-form .stars').forEach(s => s.innerHTML = Array(5).fill('<span>★</span>').join(''));
        document.getElementById('photo-preview').innerHTML = '';
        document.getElementById('review-modal').classList.remove('hidden');
    };
    window.closeReviewModal = function() { document.getElementById('review-modal').classList.add('hidden'); };

    function setupStars() {
        document.querySelectorAll('#review-form .stars').forEach(el => {
            const crit = el.getAttribute('data-crit');
            el.addEventListener('click', function(e) {
                if (e.target.tagName !== 'SPAN') return;
                const all = this.querySelectorAll('span');
                const idx = Array.from(all).indexOf(e.target);
                reviewStars[crit] = idx + 1;
                all.forEach((s, i) => {
                    if (i <= idx) { s.classList.remove('active','star-animate'); void s.offsetWidth; setTimeout(() => s.classList.add('active','star-animate'), i*60); }
                    else s.classList.remove('active','star-animate');
                });
            });
        });
    }

    /* ============ PHOTO UPLOAD ============ */
    function setupPhotoUpload() {
        const input = document.getElementById('review-photos');
        if (!input) return;
        input.addEventListener('change', function() {
            const remaining = 3 - reviewPhotos.length;
            const files = Array.from(this.files).slice(0, remaining);
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = (e) => compressImage(e.target.result, 800, 0.7, (compressed) => { reviewPhotos.push(compressed); renderPhotoPreview(); });
                reader.readAsDataURL(file);
            });
            this.value = '';
        });
    }

    function compressImage(dataUrl, maxDim, quality, cb) {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > h && w > maxDim) { h = h * maxDim / w; w = maxDim; }
            else if (h > maxDim) { w = w * maxDim / h; h = maxDim; }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            cb(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = dataUrl;
    }

    function renderPhotoPreview() {
        const preview = document.getElementById('photo-preview');
        if (!preview) return;
        preview.innerHTML = reviewPhotos.map((url, i) => `
            <div class="photo-preview-item" style="background-image:url('${url}')">
                <button class="remove-photo" onclick="removePhoto(${i})"><i class="fa-solid fa-xmark"></i></button>
            </div>`).join('');
    }
    window.removePhoto = function(i) { reviewPhotos.splice(i, 1); renderPhotoPreview(); };

    /* ============ REVIEW SUBMIT ============ */
    function setupReviewForm() {
        const form = document.getElementById('review-form');
        if (!form) return;
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const sum = Object.values(reviewStars).reduce((a,b) => a+b, 0);
            if (sum === 0) { showToast('اختر نجمة واحدة على الأقل', 'error'); return; }
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = '<span class="spinner"></span> Loading...';
            btn.disabled = true;
            try {
                let photoUrls = [];
                if (storage && reviewPhotos.length > 0) {
                    for (let i = 0; i < reviewPhotos.length; i++) {
                        try {
                            const blob = await (await fetch(reviewPhotos[i])).blob();
                            const ref = storage.ref(`reviews/${currentGymId}/${currentUser.uid}_${Date.now()}_${i}.jpg`);
                            const snap = await ref.put(blob);
                            photoUrls.push(await snap.ref.getDownloadURL());
                        } catch(err) { photoUrls.push(reviewPhotos[i]); }
                    }
                } else {
                    photoUrls = [...reviewPhotos];
                }
                const review = {
                    gymId: currentGymId, userId: currentUser.uid, username: currentUser.name,
                    criteria: { ...reviewStars },
                    overall: sum / 6,
                    photos: photoUrls,
                    timestamp: db ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
                };
                if (db) await db.collection('reviews').add(review);
                else {
                    const key = 'sharks_reviews_' + currentGymId;
                    const all = JSON.parse(localStorage.getItem(key) || '[]');
                    all.push(review); localStorage.setItem(key, JSON.stringify(all));
                }
                closeReviewModal();
                showToast(tr('review_success'), 'success');
            } catch(err) {
                console.error(err);
                showToast('Error: ' + err.message, 'error');
            } finally {
                btn.innerHTML = tr('submit');
                btn.disabled = false;
            }
        });
    }

    /* ============ AUTH ============ */
    function setupLogin() {
        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) {
            googleBtn.onclick = async function() {
                if (!auth) { showToast('Firebase غير محمل - شغل على localhost', 'error'); return; }
                googleBtn.innerHTML = '<span class="spinner"></span> Loading...';
                try {
                    const result = await auth.signInWithPopup(provider);
                    const user = result.user;
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        currentUser = { uid: user.uid, ...userDoc.data() };
                        updateProfileUI();
                        showToast(tr('welcome_back') + ' ' + (currentUser.name || ''), 'success');
                        showView('home');
                    } else {
                        document.getElementById('login-section').classList.add('hidden');
                        document.getElementById('profile-section').classList.remove('hidden');
                        document.getElementById('reg-email').value = user.email;
                    }
                    googleBtn.innerHTML = '<i class="fa-brands fa-google"></i> ' + tr('login_google');
                } catch(err) {
                    console.error(err);
                    showToast(tr('login_error') + ': ' + err.message, 'error');
                    googleBtn.innerHTML = '<i class="fa-brands fa-google"></i> ' + tr('login_google');
                }
            };
        }
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                if (!auth || !auth.currentUser) { showToast('Not authenticated', 'error'); return; }
                const newUser = {
                    name: document.getElementById('reg-name').value.trim(),
                    username: document.getElementById('reg-username').value.trim(),
                    phone: document.getElementById('reg-phone').value.trim(),
                    gov: document.getElementById('reg-gov').value,
                    city: document.getElementById('reg-city').value.trim(),
                    email: document.getElementById('reg-email').value,
                    favorites: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                try {
                    await db.collection('users').doc(auth.currentUser.uid).set(newUser);
                    currentUser = { uid: auth.currentUser.uid, ...newUser };
                    updateProfileUI();
                    showToast(tr('save_profile'), 'success');
                    document.getElementById('profile-section').classList.add('hidden');
                    document.getElementById('login-section').classList.remove('hidden');
                    form.reset();
                    showView('home');
                } catch(err) {
                    showToast('Error: ' + err.message, 'error');
                }
            });
        }
    }

    function updateProfileUI() {
        const avatar = document.getElementById('sidebar-avatar');
        const name = document.getElementById('sidebar-username');
        const status = document.getElementById('sidebar-userstatus');
        if (!avatar || !name) return;
        if (currentUser) {
            avatar.textContent = (currentUser.name || 'U').charAt(0).toUpperCase();
            name.textContent = (currentUser.name || '').split(' ')[0];
            status.textContent = currentLang === 'ar' ? 'عرض الملف' : 'View Profile';
        } else {
            avatar.textContent = 'U';
            name.textContent = tr('login');
            status.textContent = tr('click_here');
        }
    }

    window.handleProfileClick = function() { if (currentUser) showView('settings'); else showView('login'); };

    window.logout = async function() {
        try { if (auth) await auth.signOut(); } catch(e) {}
        currentUser = null;
        updateProfileUI();
        showToast(tr('logout_success'), 'info');
        showView('home');
    };

    window.requireLogin = function() {
        if (!currentUser) { showToast(tr('must_login'), 'error'); showView('login'); return false; }
        return true;
    };

    /* ============ TOP3 TOGGLE ============ */
    window.toggleTop3Visibility = function(cb) {
        const section = document.getElementById('top3-section');
        if (!section) return;
        if (cb.checked) {
            section.classList.remove('hidden');
            section.style.display = '';
            localStorage.setItem('hideTop3', 'false');
            showToast(tr('top3_shown'), 'success');
        } else {
            section.classList.add('hidden');
            section.style.display = 'none';
            localStorage.setItem('hideTop3', 'true');
            showToast(tr('top3_hidden'), 'info');
        }
    };

    /* ============ LANGUAGE ============ */
    window.toggleLanguage = function() {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', currentLang);
        document.getElementById('lang-btn').innerText = currentLang === 'ar' ? 'EN' : 'AR';
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = tr(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = tr(el.getAttribute('data-i18n-placeholder'));
        });
        // Re-render dynamic content
        renderTop3();
        renderFilteredGyms();
        renderCompareBar();
        if (currentGymData) {
            document.getElementById('details-title').innerHTML = `${currentLang === 'ar' ? currentGymData.name : currentGymData.nameEn}${currentGymData.verified ? ' <i class="fa-solid fa-circle-check verified-icon"></i>' : ''}`;
            document.getElementById('details-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${currentLang === 'ar' ? currentGymData.location : currentGymData.locationEn}`;
            document.getElementById('details-verified').innerHTML = currentGymData.verified ? `${tr('verified')} <i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>` : tr('not_verified');
            renderCriteria();
            renderHours(currentGymData);
        }
        updateProfileUI();
        if (mapInstance) updateMapMarkers();
        showToast(tr('lang_changed'), 'info');
    };

    /* ============ ANIMATIONS ============ */
    function setupCardTilt() {
        document.querySelectorAll('.gym-card').forEach(card => {
            if (card.dataset.tiltBound) return;
            card.dataset.tiltBound = '1';
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((y - rect.height/2) / rect.height) * -8;
                const ry = ((x - rect.width/2) / rect.width) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.03)`;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.setProperty('--mx', '50%');
                card.style.setProperty('--my', '50%');
            });
        });
    }

    function setupMagneticButtons() {
        document.querySelectorAll('.btn-google, .settings-btn, #calorie-form .btn-primary, .modal-actions .btn-primary, .add-review-box .btn-primary').forEach(btn => {
            if (btn.dataset.magneticBound) return;
            btn.dataset.magneticBound = '1';
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                btn.style.transform = `translate(${x*0.2}px, ${y*0.2}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    function setupParallax() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const cover = document.getElementById('details-cover');
                    const view = document.getElementById('view-details');
                    if (cover && view && !view.classList.contains('hidden')) {
                        cover.style.backgroundPositionY = `calc(50% + ${Math.min(window.scrollY * 0.15, 30)}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function setupMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        if (btn) btn.onclick = () => document.getElementById('sidebar').classList.toggle('open');
    }

    function setupPriceSliders() {
        const minEl = document.getElementById('filter-price-min');
        const maxEl = document.getElementById('filter-price-max');
        if (!minEl || !maxEl) return;
        minEl.addEventListener('input', e => {
            if (parseInt(e.target.value) > parseInt(maxEl.value)) e.target.value = maxEl.value;
            document.getElementById('price-min-display').textContent = e.target.value;
        });
        maxEl.addEventListener('input', e => {
            if (parseInt(e.target.value) < parseInt(minEl.value)) e.target.value = minEl.value;
            document.getElementById('price-max-display').textContent = e.target.value;
        });
    }

    function loadState() {
        if (localStorage.getItem('hideTop3') === 'true') {
            const cb = document.getElementById('toggle-top3');
            if (cb) cb.checked = false;
            const s = document.getElementById('top3-section');
            if (s) { s.classList.add('hidden'); s.style.display = 'none'; }
        }
        if (auth) {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const doc = await db.collection('users').doc(user.uid).get();
                        if (doc.exists) currentUser = { uid: user.uid, ...doc.data() };
                        else currentUser = { uid: user.uid, name: user.displayName || 'User', email: user.email };
                        updateProfileUI();
                    } catch(e) {}
                } else { currentUser = null; updateProfileUI(); }
            });
        }
    }

    /* ============ INIT ============ */
    document.addEventListener('DOMContentLoaded', function() {
        showSkeletons();
        setupSearch();
        setupCalculator();
        setupLogin();
        setupMobileMenu();
        setupStars();
        setupReviewForm();
        setupPhotoUpload();
        setupPriceSliders();
        loadState();
        updateProfileUI();
        setTimeout(() => {
            renderTop3();
            renderFilteredGyms();
            setupCardTilt();
            setupMagneticButtons();
            setupParallax();
        }, 700);
        console.log('✅ SHARKS App Ready');
    });

})();
