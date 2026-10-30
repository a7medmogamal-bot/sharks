(function () {
    'use strict';

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
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            provider = new firebase.auth.GoogleAuthProvider();
            if (firebase.storage) storage = firebase.storage();
        }
    } catch (e) { console.warn('Firebase init failed:', e); }

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
    let userLocation = null;
    let galleryImages = [];
    let galleryIndex = 0;
    let lightboxIndex = 0;
    let usernameCheckTimeout = null;
    let lastUsernameCheck = { username: '', available: null };

    const getCycleId = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const gyms = [
        {
            id: 'g1', name: 'جولدز جيم', nameEn: "Gold's Gym", area: 'cairo',
            location: 'القاهرة، مدينة نصر', locationEn: 'Cairo, Nasr City',
            rating: 4.9, reviews: 320, verified: true, price: '500 EGP', priceNumeric: 500,
            lat: 30.0626, lng: 31.3300, whatsapp: '201000000001', phone: '01000000001',
            womenHours: '2:00 PM - 5:00 PM', womenHoursAr: '2:00 م - 5:00 م',
            services: ['gym', 'cardio', 'boxing', 'sauna'],
            hours: { sat: '6:00-24:00', sun: '6:00-24:00', mon: '6:00-24:00', tue: '6:00-24:00', wed: '6:00-24:00', thu: '6:00-24:00', fri: '10:00-20:00' },
            cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"
            ]
        },
        {
            id: 'g2', name: 'فيتنس فيرست', nameEn: 'Fitness First', area: 'giza',
            location: 'الجيزة، المهندسين', locationEn: 'Giza, Mohandessin',
            rating: 4.7, reviews: 210, verified: true, price: '600 EGP', priceNumeric: 600,
            lat: 30.0561, lng: 31.2009, whatsapp: '201000000002', phone: '01000000002',
            womenHours: '12:00 PM - 4:00 PM', womenHoursAr: '12:00 م - 4:00 م',
            services: ['gym', 'cardio', 'yoga', 'pool', 'sauna'],
            hours: { sat: '7:00-23:00', sun: '7:00-23:00', mon: '7:00-23:00', tue: '7:00-23:00', wed: '7:00-23:00', thu: '7:00-23:00', fri: '9:00-21:00' },
            cover: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1591741535018-d042766c62eb?q=80&w=1200&auto=format&fit=crop"
            ]
        },
        {
            id: 'g3', name: 'ماي جيم', nameEn: 'My Gym', area: 'alex',
            location: 'الإسكندرية، سموحة', locationEn: 'Alexandria, Smouha',
            rating: 4.5, reviews: 150, verified: false, price: '400 EGP', priceNumeric: 400,
            lat: 31.2057, lng: 29.9553, whatsapp: '201000000003', phone: '01000000003',
            womenHours: '', womenHoursAr: '',
            services: ['gym', 'cardio'],
            hours: { sat: '8:00-22:00', sun: '8:00-22:00', mon: '8:00-22:00', tue: '8:00-22:00', wed: '8:00-22:00', thu: '8:00-22:00', fri: '10:00-18:00' },
            cover: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"
            ]
        },
        {
            id: 'g4', name: 'جيم بلس', nameEn: 'Gym Plus', area: 'cairo',
            location: 'القاهرة، المعادي', locationEn: 'Cairo, Maadi',
            rating: 4.2, reviews: 85, verified: false, price: '350 EGP', priceNumeric: 350,
            lat: 29.9602, lng: 31.2569, whatsapp: '201000000004', phone: '01000000004',
            womenHours: '3:00 PM - 6:00 PM', womenHoursAr: '3:00 م - 6:00 م',
            services: ['gym', 'cardio', 'yoga'],
            hours: { sat: '6:00-23:00', sun: '6:00-23:00', mon: '6:00-23:00', tue: '6:00-23:00', wed: '6:00-23:00', thu: '6:00-23:00', fri: '10:00-20:00' },
            cover: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
            images: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"]
        },
        {
            id: 'g5', name: 'أوليمبيا جيم', nameEn: 'Olympia Gym', area: 'cairo',
            location: 'القاهرة، مصر الجديدة', locationEn: 'Cairo, Heliopolis',
            rating: 4.6, reviews: 112, verified: true, price: '450 EGP', priceNumeric: 450,
            lat: 30.0910, lng: 31.3400, whatsapp: '201000000005', phone: '01000000005',
            womenHours: '', womenHoursAr: '',
            services: ['gym', 'cardio', 'boxing'],
            hours: { sat: '6:00-24:00', sun: '6:00-24:00', mon: '6:00-24:00', tue: '6:00-24:00', wed: '6:00-24:00', thu: '6:00-24:00', fri: '10:00-20:00' },
            cover: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop",
            images: ["https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop"]
        },
        {
            id: 'g6', name: 'بلاتينيوم جيم', nameEn: 'Platinum Gym', area: 'giza',
            location: 'الجيزة، الدقي', locationEn: 'Giza, Dokki',
            rating: 4.8, reviews: 245, verified: true, price: '750 EGP', priceNumeric: 750,
            lat: 30.0385, lng: 31.2106, whatsapp: '201000000006', phone: '01000000006',
            womenHours: '1:00 PM - 4:00 PM', womenHoursAr: '1:00 م - 4:00 م',
            services: ['gym', 'cardio', 'yoga', 'pool', 'sauna', 'boxing'],
            hours: { sat: '6:00-24:00', sun: '6:00-24:00', mon: '6:00-24:00', tue: '6:00-24:00', wed: '6:00-24:00', thu: '6:00-24:00', fri: '8:00-22:00' },
            cover: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1200&auto=format&fit=crop",
            images: ["https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1200&auto=format&fit=crop"]
        }
    ];

    const T = {
        ar: {
            nav_home: 'الرئيسية', nav_map: 'الخريطة', nav_calories: 'السعرات الحرارية', nav_favorites: 'المفضلة',
            nav_top10: 'أفضل 10 جيمات', nav_messages: 'الرسائل', nav_ai: 'SHARKS AI', nav_store: 'المتجر',
            nav_coaches: 'المدربون', nav_about: 'حول', nav_who: 'من نحن', nav_settings: 'الإعدادات',
            login: 'تسجيل الدخول', click_here: 'اضغط هنا', search_placeholder: 'ابحث عن جيم، منطقة، أو ميزة...',
            top3_title: 'أفضل 3 جيمات هذا الشهر', nearby_title: 'الجيمات الأقرب إليك', all_gyms_title: 'كل الجيمات',
            view_all: 'عرض الكل', view_list: 'عرض القائمة', map_title: 'خريطة الجيمات',
            rank1: 'المركز الأول', rank2: 'المركز الثاني', rank3: 'المركز الثالث', details: 'التفاصيل', preview: 'معاينة',
            login_title: 'مرحباً بك في SHARKS', login_subtitle: 'اكتشف أفضل الجيمات في مصر، قيم تجربتك، وتابع أهدافك.',
            login_google: 'تسجيل الدخول باستخدام Google', profile_title: 'استكمال الملف الشخصي',
            profile_subtitle: 'محتاجين شوية بيانات عشان نكمل معاك.', full_name: 'الاسم الرباعي',
            username: 'اسم المستخدم', phone: 'رقم الهاتف', governorate: 'المحافظة', city: 'المركز / المنطقة',
            email: 'البريد الإلكتروني', save_continue: 'حفظ ومتابعة', cairo: 'القاهرة', giza: 'الجيزة', alex: 'الإسكندرية',
            back: 'رجوع', call: 'اتصال', whatsapp: 'واتساب', map: 'الموقع', reviews_title: 'التقييمات',
            rate_experience: 'قيم تجربتك', login_to_rate: 'يجب تسجيل الدخول لتتمكن من التقييم.', add_review: 'أضف تقييمك',
            extra_info: 'معلومات إضافية', price: 'الأسعار:', last_update: 'آخر تحديث:', status: 'الحالة:',
            verified: 'موثّق', not_verified: 'غير موثّق', report: 'الإبلاغ عن بيانات خاطئة',
            working_hours: 'مواعيد العمل', women_hours: 'مواعيد السيدات', day_sat: 'السبت', day_sun: 'الأحد',
            day_mon: 'الإثنين', day_tue: 'الثلاثاء', day_wed: 'الأربعاء', day_thu: 'الخميس', day_fri: 'الجمعة',
            crit_equipment: 'الأجهزة والمعدات', crit_cleanliness: 'النظافة', crit_location: 'المكان والموقع',
            crit_staff: 'التعامل وخدمة العملاء', crit_organization: 'النظام والتنظيم', crit_price: 'السعر',
            rate_title: 'قيم تجربتك', add_photos: 'أضف صور (اختياري)', photo_hint: 'اضغط لرفع صور من جهازك',
            photo_limit: 'بحد أقصى 3 صور', cancel: 'إلغاء', submit: 'إرسال التقييم', messages_title: 'الرسائل',
            msg_welcome_title: 'أهلاً بك في SHARKS', msg_welcome_body: 'شكراً لانضمامك إلينا.',
            msg_time_2h: 'منذ ساعتين', msg_winner_title: 'إعلان الفائزين الشهريين',
            msg_winner_body: 'تم إعلان أفضل 3 جيمات لهذا الشهر.', msg_time_1d: 'منذ يوم',
            calories_title: 'حاسبة السعرات الحرارية', age: 'العمر', gender: 'الجنس', male: 'ذكر', female: 'أنثى',
            height: 'الطول', weight: 'الوزن', activity: 'مستوى النشاط', sedentary: 'قليل الحركة (لا رياضة)',
            light: 'نشاط خفيف (1-3 أيام)', moderate: 'نشاط متوسط (3-5 أيام)', active: 'نشاط عالي (6-7 أيام)',
            very_active: 'نشاط شديد (رياضي محترف)', goal: 'الهدف',
            lose: 'خفض الدهون', maintain: 'المحافظة', gain: 'بناء العضلات', calculate: 'احسب',
            daily_need: 'احتياجك اليومي:', calories_unit: 'سعرة', favorites_title: 'المفضلة',
            no_favorites: 'لا توجد جيمات في المفضلة حالياً.', top10_title: 'أفضل 10 جيمات',
            settings_title: 'الإعدادات', account_settings: 'الحساب', my_profile: 'ملفي الشخصي',
            edit_profile: 'تعديل البيانات الشخصية', location_permission: 'إذن الموقع',
            display_settings: 'العرض', show_top3: 'إظهار قسم أفضل 3 جيمات',
            about_platform: 'عن المنصة', logout: 'تسجيل الخروج',
            filters: 'الفلاتر', filter_area: 'المنطقة', all_areas: 'كل المناطق',
            filter_price: 'نطاق السعر (جنيه)', filter_rating: 'التقييم', stars: 'نجوم',
            filter_services: 'الخدمات', service_gym: 'صالة حديد', service_cardio: 'كارديو',
            service_boxing: 'ملاكمة', service_yoga: 'يوغا', service_pool: 'مسبح', service_sauna: 'ساونا',
            filter_extra: 'خيارات إضافية', filter_women: 'مواعيد سيدات', filter_verified: 'موثّق فقط',
            apply_filters: 'تطبيق الفلاتر', clear_all: 'مسح الكل', compare_selected: 'جيم مختار',
            compare_now: 'قارن الآن', compare_title: 'مقارنة الجيمات', compare_criteria: 'المعيار',
            compare_name: 'الجيم', compare_location: 'الموقع', compare_rating: 'التقييم',
            compare_reviews: 'عدد التقييمات', compare_price: 'السعر', compare_verified: 'موثّق',
            compare_services: 'الخدمات', compare_women: 'مواعيد السيدات', compare_distance: 'المسافة',
            lang_changed: 'تم تغيير اللغة', welcome_back: 'مرحباً بعودتك',
            save_profile: 'تم حفظ بياناتك بنجاح!', logout_success: 'تم تسجيل الخروج',
            must_login: 'يجب تسجيل الدخول أولاً', added_fav: 'تمت الإضافة للمفضلة',
            removed_fav: 'تمت الإزالة من المفضلة', top3_shown: 'تم إظهار قسم أفضل 3',
            top3_hidden: 'تم إخفاء قسم أفضل 3', login_error: 'فشل تسجيل الدخول',
            review_success: 'تم إرسال تقييمك! شكراً لك', filters_applied: 'تم تطبيق الفلاتر',
            filters_cleared: 'تم مسح الفلاتر', max_compare: 'الحد الأقصى 3 جيمات',
            min_compare: 'اختر جيمين على الأقل', result_count: 'نتيجة',
            offline_msg: 'أنت غير متصل بالإنترنت', error_title: 'حدث خطأ ما', retry: 'إعادة المحاولة',
            profile_loading: 'جاري التحميل...', profile_reviews: 'تقييمات',
            profile_favorites: 'مفضلة', profile_joined: 'عضو منذ', my_reviews: 'تقييماتي',
            no_reviews_yet: 'لم تقم بأي تقييم بعد.', badge_new: 'عضو جديد', badge_active: 'عضو نشط',
            badge_expert: 'خبير', badge_verified: 'موثّق', badge_reviewer: 'مقيّم',
            review_already_done: 'لقد قمت بتقييم هذا الجيم هذا الشهر. هل تريد تعديل تقييمك؟',
            review_updated: 'تم تحديث تقييمك', location_denied: 'يتم استخدام محافظتك من الملف الشخصي',
            km: 'كم', photo: 'صورة', get_location: 'تحديد موقعي', location_success: 'تم تحديد موقعك بنجاح',
            location_error: 'فشل تحديد الموقع', location_unsupported: 'المتصفح لا يدعم خدمة الموقع',
            your_data: 'بياناتك', your_data_sub: 'أدخل بياناتك لنتائج دقيقة',
            your_results: 'نتائجك', your_results_sub: 'بناءً على بياناتك',
            age_unit: 'سنة', height_unit: 'سم', weight_unit: 'كجم',
            daily_calories: 'السعرات اليومية المستهدفة', bmr: 'معدل الأيض الأساسي',
            bmr_desc: 'السعرات التي يحرقها جسمك في الراحة', tdee: 'الحرق اليومي الكلي',
            tdee_desc: 'السعرات التي يحرقها جسمك مع نشاطك', bmi: 'مؤشر كتلة الجسم',
            bmi_under: 'نقص', bmi_normal: 'طبيعي', bmi_over: 'زيادة', bmi_obese: 'سمنة',
            bmi_status_under: 'وزنك أقل من الطبيعي، حاول تزود وزنك بشكل صحي',
            bmi_status_normal: 'وزنك مثالي، حافظ على نمط حياتك الصحي',
            bmi_status_over: 'وزنك أعلى من الطبيعي، انتبه لنظامك الغذائي',
            bmi_status_obese: 'وزنك مرتفع بشكل ملحوظ، يُنصح باستشارة متخصص',
            macros_title: 'توزيع الماكروز اليومي', macros_protein: 'بروتين',
            macros_carbs: 'كربوهيدرات', macros_fats: 'دهون',
            water_intake: 'المياه الموصى بها', liters: 'لتر يومياً',
            goal_badge_lose: '🎯 هدفك: خسارة الوزن',
            goal_badge_maintain: '🎯 هدفك: الحفاظ على الوزن',
            goal_badge_gain: '🎯 هدفك: بناء العضلات',
            edit_profile_title: 'تعديل الملف الشخصي', edit_profile_sub: 'حدّث بياناتك في أي وقت',
            save: 'حفظ التغييرات', username_hint: '3-30 حرف، إنجليزي وأرقام و_',
            username_available: 'متاح للاستخدام', username_taken: 'مستخدم بالفعل',
            username_checking: 'جاري التحقق...', username_invalid: 'صيغة غير صحيحة',
            username_saved: 'تم تحديث اسم المستخدم بنجاح',
            profile_updated: 'تم تحديث بياناتك بنجاح', profile_error: 'حدث خطأ أثناء الحفظ',
            username_length: 'اسم المستخدم يجب أن يكون 3-30 حرف',
            username_format: 'استخدم حروف إنجليزية وأرقام و _ فقط',
            name_required: 'الاسم مطلوب', phone_invalid: 'رقم الهاتف غير صحيح'
        },
        en: {
            nav_home: 'Home', nav_map: 'Map', nav_calories: 'Calories', nav_favorites: 'Favorites',
            nav_top10: 'Top 10 Gyms', nav_messages: 'Messages', nav_ai: 'SHARKS AI', nav_store: 'Store',
            nav_coaches: 'Coaches', nav_about: 'About', nav_who: 'Who We Are', nav_settings: 'Settings',
            login: 'Login', click_here: 'Click here', search_placeholder: 'Search for a gym, area, or feature...',
            top3_title: 'Top 3 Gyms This Month', nearby_title: 'Nearby Gyms', all_gyms_title: 'All Gyms',
            view_all: 'View All', view_list: 'View List', map_title: 'Gyms Map',
            rank1: '1st Place', rank2: '2nd Place', rank3: '3rd Place', details: 'Details', preview: 'Preview',
            login_title: 'Welcome to SHARKS', login_subtitle: 'Discover the best gyms in Egypt, rate your experience.',
            login_google: 'Sign in with Google', profile_title: 'Complete Profile',
            profile_subtitle: 'We need some data to continue.', full_name: 'Full Name',
            username: 'Username', phone: 'Phone', governorate: 'Governorate', city: 'City / Area',
            email: 'Email', save_continue: 'Save & Continue', cairo: 'Cairo', giza: 'Giza', alex: 'Alexandria',
            back: 'Back', call: 'Call', whatsapp: 'WhatsApp', map: 'Location', reviews_title: 'Reviews',
            rate_experience: 'Rate your experience', login_to_rate: 'You must login to rate.', add_review: 'Add Review',
            extra_info: 'Extra Info', price: 'Price:', last_update: 'Last Update:', status: 'Status:',
            verified: 'Verified', not_verified: 'Not Verified', report: 'Report wrong data',
            working_hours: 'Working Hours', women_hours: 'Women Hours', day_sat: 'Sat', day_sun: 'Sun',
            day_mon: 'Mon', day_tue: 'Tue', day_wed: 'Wed', day_thu: 'Thu', day_fri: 'Fri',
            crit_equipment: 'Equipment', crit_cleanliness: 'Cleanliness', crit_location: 'Location',
            crit_staff: 'Staff & Service', crit_organization: 'Organization', crit_price: 'Price',
            rate_title: 'Rate your experience', add_photos: 'Add photos (optional)',
            photo_hint: 'Click to upload from device', photo_limit: 'Max 3 photos', cancel: 'Cancel',
            submit: 'Submit Review', messages_title: 'Messages', msg_welcome_title: 'Welcome to SHARKS',
            msg_welcome_body: 'Thanks for joining.', msg_time_2h: '2 hours ago',
            msg_winner_title: 'Monthly Winners Announced', msg_winner_body: 'Top 3 gyms this month announced.',
            msg_time_1d: '1 day ago', calories_title: 'Calorie Calculator', age: 'Age', gender: 'Gender',
            male: 'Male', female: 'Female', height: 'Height', weight: 'Weight',
            activity: 'Activity Level', sedentary: 'Sedentary (no exercise)', light: 'Light (1-3 days)',
            moderate: 'Moderate (3-5 days)', active: 'Active (6-7 days)', very_active: 'Very Active (athlete)',
            goal: 'Goal', lose: 'Lose Fat', maintain: 'Maintain', gain: 'Build Muscle', calculate: 'Calculate',
            daily_need: 'Daily Need:', calories_unit: 'kcal', favorites_title: 'Favorites',
            no_favorites: 'No favorite gyms yet.', top10_title: 'Top 10 Gyms',
            settings_title: 'Settings', account_settings: 'Account', my_profile: 'My Profile',
            edit_profile: 'Edit Profile', location_permission: 'Location',
            display_settings: 'Display', show_top3: 'Show Top 3 Section',
            about_platform: 'About', logout: 'Logout',
            filters: 'Filters', filter_area: 'Area', all_areas: 'All Areas', filter_price: 'Price Range (EGP)',
            filter_rating: 'Rating', stars: 'stars', filter_services: 'Services', service_gym: 'Gym',
            service_cardio: 'Cardio', service_boxing: 'Boxing', service_yoga: 'Yoga', service_pool: 'Pool',
            service_sauna: 'Sauna', filter_extra: 'More Options', filter_women: 'Women Hours',
            filter_verified: 'Verified Only', apply_filters: 'Apply Filters', clear_all: 'Clear All',
            compare_selected: 'gyms selected', compare_now: 'Compare Now', compare_title: 'Compare Gyms',
            compare_criteria: 'Criteria', compare_name: 'Gym', compare_location: 'Location',
            compare_rating: 'Rating', compare_reviews: 'Reviews', compare_price: 'Price',
            compare_verified: 'Verified', compare_services: 'Services', compare_women: 'Women Hours',
            compare_distance: 'Distance',
            lang_changed: 'Language changed', welcome_back: 'Welcome back', save_profile: 'Profile saved!',
            logout_success: 'Logged out', must_login: 'Please login first', added_fav: 'Added to favorites',
            removed_fav: 'Removed from favorites', top3_shown: 'Top 3 shown', top3_hidden: 'Top 3 hidden',
            login_error: 'Login failed', review_success: 'Review submitted! Thanks',
            filters_applied: 'Filters applied', filters_cleared: 'Filters cleared',
            max_compare: 'Max 3 gyms', min_compare: 'Select at least 2 gyms', result_count: 'results',
            offline_msg: 'You are offline', error_title: 'Something went wrong', retry: 'Retry',
            profile_loading: 'Loading...', profile_reviews: 'Reviews', profile_favorites: 'Favorites',
            profile_joined: 'Member since', my_reviews: 'My Reviews', no_reviews_yet: 'No reviews yet.',
            badge_new: 'New Member', badge_active: 'Active Member', badge_expert: 'Expert',
            badge_verified: 'Verified', badge_reviewer: 'Reviewer',
            review_already_done: 'Already reviewed this month. Edit your review?',
            review_updated: 'Review updated', location_denied: 'Using governorate from profile',
            km: 'km', photo: 'photo', get_location: 'Locate me', location_success: 'Location detected',
            location_error: 'Failed to detect location', location_unsupported: 'Geolocation not supported',
            your_data: 'Your Data', your_data_sub: 'Enter your details for accurate results',
            your_results: 'Your Results', your_results_sub: 'Based on your data',
            age_unit: 'years', height_unit: 'cm', weight_unit: 'kg',
            daily_calories: 'Daily Target Calories', bmr: 'Basal Metabolic Rate',
            bmr_desc: 'Calories burned at rest', tdee: 'Total Daily Energy',
            tdee_desc: 'Calories burned with activity', bmi: 'Body Mass Index',
            bmi_under: 'Under', bmi_normal: 'Normal', bmi_over: 'Over', bmi_obese: 'Obese',
            bmi_status_under: 'You are underweight, try gaining weight healthily',
            bmi_status_normal: 'Your weight is ideal, keep up the healthy lifestyle',
            bmi_status_over: 'You are overweight, watch your diet',
            bmi_status_obese: 'You are significantly overweight, consult a specialist',
            macros_title: 'Daily Macros Distribution', macros_protein: 'Protein',
            macros_carbs: 'Carbs', macros_fats: 'Fats',
            water_intake: 'Recommended Water', liters: 'L/day',
            goal_badge_lose: '🎯 Goal: Lose Fat',
            goal_badge_maintain: '🎯 Goal: Maintain Weight',
            goal_badge_gain: '🎯 Goal: Build Muscle',
            edit_profile_title: 'Edit Profile', edit_profile_sub: 'Update your info anytime',
            save: 'Save Changes', username_hint: '3-30 chars, English letters, numbers & _',
            username_available: 'Available', username_taken: 'Already taken',
            username_checking: 'Checking...', username_invalid: 'Invalid format',
            username_saved: 'Username updated successfully',
            profile_updated: 'Profile updated successfully', profile_error: 'Error saving profile',
            username_length: 'Username must be 3-30 characters',
            username_format: 'Use English letters, numbers, and _ only',
            name_required: 'Name is required', phone_invalid: 'Invalid phone number'
        }
    };

    const tr = (key) => (T[currentLang] && T[currentLang][key]) || key;

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

    function animateNumber(el, target, duration) {
        if (!el) return;
        duration = duration || 1200;
        const startTime = performance.now();
        const startVal = 0;
        function update(t) {
            const elapsed = t - startTime;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(startVal + (target - startVal) * eased);
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

    function haversine(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function updateURL(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(k => {
            if (params[k] === null || params[k] === undefined || params[k] === '') url.searchParams.delete(k);
            else url.searchParams.set(k, params[k]);
        });
        history.pushState({}, '', url);
    }

    function handleDeepLink() {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view') || 'home';
        const gym = params.get('gym');
        if (gym && view === 'details') openGymDetails(gym);
        else showView(view);
    }

    window.showView = function (viewId, skipURL) {
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

        if (!skipURL) {
            if (viewId === 'details' && currentGymId) updateURL({ view: 'details', gym: currentGymId });
            else updateURL({ view: viewId, gym: null });
        }

        if (viewId === 'favorites') renderFavorites();
        if (viewId === 'top10') renderTop10();
        if (viewId === 'map') setTimeout(initMap, 100);
        if (viewId === 'profile') loadProfile();
    };

    function renderTop3() {
        const container = document.getElementById('podium-container');
        if (!container) return;
        const sorted = [...gyms].sort((a, b) => b.rating - a.rating).slice(0, 3);
        const card = (g, rank) => `
            <div class="podium-item podium-${rank}">
                <div class="gym-card podium-card" onclick="window.openGymDetails('${g.id}')">
                    <div class="badge"><i class="fa-solid fa-trophy"></i> ${tr('rank' + rank)}</div>
                    <div class="card-image" style="background-image:url('${g.cover}')"></div>
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

    function gymCardHTML(g, distance) {
        const isSelected = compareList.includes(g.id);
        const distanceText = distance !== null && distance !== undefined
            ? `<span style="color:var(--primary-blue);font-size:12px;font-weight:700;">• ${distance.toFixed(1)} ${tr('km')}</span>`
            : '';
        return `
            <div class="gym-card" data-gym-id="${g.id}">
                <div class="compare-checkbox ${isSelected ? 'selected' : ''}" data-compare-id="${g.id}">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div class="card-image" style="background-image:url('${g.cover}')"></div>
                <div class="card-content">
                    <div class="card-title-row">
                        <div class="card-title">${currentLang === 'ar' ? g.name : g.nameEn}</div>
                        ${g.verified ? '<i class="fa-solid fa-circle-check verified-icon"></i>' : ''}
                    </div>
                    <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${currentLang === 'ar' ? g.location : g.locationEn} ${distanceText}</div>
                    <div class="card-footer">
                        <div class="rating"><i class="fa-solid fa-star"></i> ${g.rating} <span>(${g.reviews})</span></div>
                        <button class="btn-primary">${tr('details')}</button>
                    </div>
                </div>
            </div>`;
    }

    function renderFilteredGyms() {
        const filtered = getFilteredGyms();
        const allGrid = document.getElementById('all-gyms-grid');
        const nearbyGrid = document.getElementById('nearby-gyms-grid');
        const count = document.getElementById('results-count');

        let sorted = [...filtered];
        if (userLocation) {
            sorted = sorted.map(g => ({ ...g, _distance: haversine(userLocation.lat, userLocation.lng, g.lat, g.lng) }))
                .sort((a, b) => a._distance - b._distance);
        }

        if (allGrid) {
            allGrid.innerHTML = sorted.length
                ? sorted.map(g => gymCardHTML(g, g._distance)).join('')
                : `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:20px;">${currentLang === 'ar' ? 'لا توجد نتائج' : 'No results'}</p>`;
            bindGymCardEvents(allGrid);
        }

        if (nearbyGrid) {
            nearbyGrid.innerHTML = sorted.slice(0, 2).map(g => gymCardHTML(g, g._distance)).join('');
            bindGymCardEvents(nearbyGrid);
        }

        if (count) count.textContent = `${sorted.length} ${tr('result_count')}`;
        setupCardTilt();
    }

    function bindGymCardEvents(container) {
        container.querySelectorAll('.gym-card').forEach(card => {
            const gymId = card.dataset.gymId;
            if (!gymId) return;
            card.addEventListener('click', function (e) {
                if (e.target.closest('.compare-checkbox')) return;
                window.openGymDetails(gymId);
            });
            const cb = card.querySelector('.compare-checkbox');
            if (cb) {
                cb.addEventListener('click', function (e) {
                    e.stopPropagation();
                    toggleCompare(gymId, e);
                });
            }
        });
    }

    window.toggleFilters = function () {
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

    window.applyFilters = function () {
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

    window.clearFilters = function () {
        document.getElementById('filter-area').value = '';
        document.getElementById('filter-price-min').value = 0;
        document.getElementById('filter-price-max').value = 1000;
        document.getElementById('price-min-display').textContent = '0';
        document.getElementById('price-max-display').textContent = '1000';
        document.querySelectorAll('.filter-rating, .filter-service').forEach(el => el.checked = false);
        document.getElementById('filter-women-hours').checked = false;
        document.getElementById('filter-verified').checked = false;
        filters = { area: '', priceMin: 0, priceMax: 1000, ratings: [], services: [], womenHours: false, verified: false };
        renderFilteredGyms();
        showToast(tr('filters_cleared'), 'info');
    };

    function toggleCompare(gymId, e) {
        if (e) e.stopPropagation();
        const idx = compareList.indexOf(gymId);
        if (idx > -1) compareList.splice(idx, 1);
        else {
            if (compareList.length >= 3) { showToast(tr('max_compare'), 'error'); return; }
            compareList.push(gymId);
        }
        renderCompareBar();
        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            const id = cb.dataset.compareId;
            if (id) cb.classList.toggle('selected', compareList.includes(id));
        });
    }

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
            if (g) html += `<div class="compare-slot" style="background-image:url('${g.cover}')"><button class="remove-slot" onclick="event.stopPropagation(); window.removeCompare('${id}')"><i class="fa-solid fa-xmark"></i></button></div>`;
        });
        for (let i = compareList.length; i < 3; i++) html += '<div class="compare-slot empty"><i class="fa-solid fa-plus"></i></div>';
        slots.innerHTML = html;
    }

    window.removeCompare = function (id) {
        compareList = compareList.filter(x => x !== id);
        renderCompareBar();
        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            if (cb.dataset.compareId === id) cb.classList.remove('selected');
        });
    };

    window.clearCompare = function () {
        compareList = [];
        renderCompareBar();
        document.querySelectorAll('.compare-checkbox').forEach(c => c.classList.remove('selected'));
    };

    window.openCompareModal = function () {
        if (compareList.length < 2) { showToast(tr('min_compare'), 'error'); return; }
        const selected = compareList.map(id => gyms.find(g => g.id === id)).filter(Boolean);
        const rows = [
            { label: tr('compare_name'), render: g => `<div class="compare-img" style="background-image:url('${g.cover}')"></div><div class="compare-name">${currentLang === 'ar' ? g.name : g.nameEn}</div>` },
            { label: tr('compare_location'), render: g => currentLang === 'ar' ? g.location : g.locationEn }
        ];

        if (userLocation) {
            rows.push({
                label: tr('compare_distance'),
                render: g => `<span class="rating-value">${haversine(userLocation.lat, userLocation.lng, g.lat, g.lng).toFixed(1)} ${tr('km')}</span>`,
                best: g => -haversine(userLocation.lat, userLocation.lng, g.lat, g.lng)
            });
        }

        rows.push(
            { label: tr('compare_rating'), render: g => `<span class="rating-value">⭐ ${g.rating}</span>`, best: g => g.rating },
            { label: tr('compare_reviews'), render: g => g.reviews, best: g => g.reviews },
            { label: tr('compare_price'), render: g => g.price, best: g => -g.priceNumeric },
            { label: tr('compare_verified'), render: g => g.verified ? '<span style="color:var(--primary-blue);">✔</span>' : '<span style="color:var(--text-muted);">✘</span>', best: g => g.verified ? 1 : 0 },
            { label: tr('compare_services'), render: g => g.services.map(s => tr('service_' + s)).join(', ') },
            { label: tr('compare_women'), render: g => (currentLang === 'ar' ? g.womenHoursAr : g.womenHours) || '—' }
        );

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

    window.closeCompareModal = function () {
        document.getElementById('compare-modal').classList.add('hidden');
    };

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

    window.openGymDetails = function (gymId) {
        const g = gyms.find(x => x.id === gymId);
        if (!g) { showToast('Gym not found', 'error'); return; }
        currentGymId = gymId;
        currentGymData = g;

        galleryImages = g.images && g.images.length > 0 ? g.images : (g.cover ? [g.cover] : []);
        galleryIndex = 0;
        renderGallery();

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

    function renderGallery() {
        const mainImg = document.getElementById('gallery-main-img');
        const thumbsContainer = document.getElementById('gallery-thumbs');
        const counter = document.getElementById('gallery-counter-text');
        if (!mainImg || !thumbsContainer) return;

        if (galleryImages.length === 0) {
            mainImg.style.backgroundImage = '';
            mainImg.classList.add('no-image');
            thumbsContainer.innerHTML = '';
            if (counter) counter.textContent = '0 / 0';
            return;
        }

        mainImg.classList.remove('no-image');
        mainImg.style.backgroundImage = `url('${galleryImages[galleryIndex]}')`;
        if (counter) counter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

        const maxThumbs = 6;
        const shown = galleryImages.slice(0, maxThumbs);
        thumbsContainer.innerHTML = shown.map((img, i) => `
            <div class="gallery-thumb ${i === galleryIndex ? 'active' : ''}" 
                 style="background-image:url('${img}')"
                 onclick="event.stopPropagation(); window.setGalleryIndex(${i})"></div>
        `).join('') + (galleryImages.length > maxThumbs
            ? `<div class="gallery-thumb gallery-thumb-more" onclick="event.stopPropagation(); window.openLightbox(${maxThumbs})">+${galleryImages.length - maxThumbs}</div>`
            : '');
    }

    window.setGalleryIndex = function (i) {
        if (i < 0 || i >= galleryImages.length) return;
        galleryIndex = i;
        renderGallery();
    };

    window.galleryPrev = function () {
        galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
        renderGallery();
    };

    window.galleryNext = function () {
        galleryIndex = (galleryIndex + 1) % galleryImages.length;
        renderGallery();
    };

    window.openLightbox = function (index) {
        if (galleryImages.length === 0) return;
        lightboxIndex = index || 0;
        document.getElementById('lightbox').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        renderLightbox();
    };

    window.closeLightbox = function () {
        document.getElementById('lightbox').classList.add('hidden');
        document.body.style.overflow = '';
    };

    window.lightboxPrev = function () {
        lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
        renderLightbox();
    };

    window.lightboxNext = function () {
        lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
        renderLightbox();
    };

    function renderLightbox() {
        const img = document.getElementById('lightbox-image');
        const counter = document.getElementById('lightbox-counter');
        const thumbs = document.getElementById('lightbox-thumbs');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        if (!img) return;
        img.style.opacity = '0';
        img.onload = () => { img.style.transition = 'opacity 0.3s'; img.style.opacity = '1'; };
        img.src = galleryImages[lightboxIndex];
        img.alt = `${tr('photo')} ${lightboxIndex + 1}`;
        if (counter) counter.textContent = `${lightboxIndex + 1} / ${galleryImages.length}`;
        if (galleryImages.length <= 1) {
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
        } else {
            if (prevBtn) prevBtn.disabled = false;
            if (nextBtn) nextBtn.disabled = false;
        }
        if (thumbs) {
            thumbs.innerHTML = galleryImages.map((url, i) => `
                <div class="lightbox-thumb ${i === lightboxIndex ? 'active' : ''}" 
                     style="background-image:url('${url}')"
                     onclick="window.setLightboxIndex(${i})"></div>
            `).join('');
            const active = thumbs.querySelector('.active');
            if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    window.setLightboxIndex = function (i) {
        lightboxIndex = i;
        renderLightbox();
    };

    window.toggleFullscreen = function () {
        const wrap = document.getElementById('lightbox-image-wrap');
        if (!document.fullscreenElement) {
            (wrap.requestFullscreen || wrap.webkitRequestFullscreen).call(wrap);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        }
    };

    function setupImageProtection() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                showToast(currentLang === 'ar' ? 'غير مسموح بتنزيل الصور' : 'Image download not allowed', 'error');
                return false;
            }
        });
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'IMG' || e.target.classList.contains('gallery-main-img') || e.target.classList.contains('gallery-thumb') || e.target.classList.contains('lightbox-thumb')) {
                e.preventDefault();
                return false;
            }
        });
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG' || e.target.classList.contains('gallery-main-img')) {
                e.preventDefault();
                return false;
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        const lightboxOpen = !document.getElementById('lightbox').classList.contains('hidden');
        if (lightboxOpen) {
            if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); lightboxNext(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); lightboxPrev(); }
        }
    });

    function setupSwipe() {
        let touchStartX = 0, touchEndX = 0;
        const wrap = document.getElementById('lightbox-image-wrap');
        if (!wrap) return;
        wrap.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        wrap.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) lightboxNext(); else lightboxPrev();
            }
        }, { passive: true });
    }

    function renderCriteria() {
        const criteria = [
            { label: tr('crit_equipment'), val: 4.5 },
            { label: tr('crit_cleanliness'), val: 4.0 },
            { label: tr('crit_location'), val: 4.8 },
            { label: tr('crit_staff'), val: 4.3 },
            { label: tr('crit_organization'), val: 4.4 },
            { label: tr('crit_price'), val: 3.5 }
        ];
        const container = document.getElementById('rating-criteria');
        if (!container) return;
        container.innerHTML = criteria.map(c => `
            <div class="criteria-row">
                <span>${c.label}</span>
                <div class="progress-bar"><div class="progress" style="width:0%" data-target="${(c.val / 5) * 100}%"></div></div>
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
        const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
        const table = document.querySelector('#view-details .hours-table');
        if (table) table.innerHTML = days.map(d => `<tr><td>${tr('day_' + d)}</td><td>${g.hours[d]}</td></tr>`).join('');
        const container = document.getElementById('women-hours-container');
        if (container) {
            container.innerHTML = g.womenHours ? `
                <div class="women-hours-card">
                    <h4><i class="fa-solid fa-female"></i> ${tr('women_hours')}</h4>
                    <p>${currentLang === 'ar' ? g.womenHoursAr : g.womenHours}</p>
                </div>` : '';
        }
    }

    function setupSearch() {
        const input = document.getElementById('global-search');
        if (!input) return;
        input.addEventListener('input', function () {
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
            const goalEl = document.querySelector('input[name="calc-goal"]:checked');
            const goal = goalEl ? goalEl.value : 'lose';

            if (!age || !height || !weight) {
                showToast(currentLang === 'ar' ? 'أدخل كل البيانات' : 'Fill all data', 'error');
                return;
            }

            const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
            let tdee = bmr * activity;
            let targetCalories = tdee;
            if (goal === 'lose') targetCalories -= 500;
            if (goal === 'gain') targetCalories += 500;

            const proteinG = Math.round((targetCalories * 0.30) / 4);
            const carbsG = Math.round((targetCalories * 0.40) / 4);
            const fatsG = Math.round((targetCalories * 0.30) / 9);

            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);
            const water = (weight * 0.035).toFixed(1);

            animateNumber(document.getElementById('result-calories'), Math.round(targetCalories));
            animateNumber(document.getElementById('result-bmr'), Math.round(bmr));
            animateNumber(document.getElementById('result-tdee'), Math.round(tdee));
            document.getElementById('result-bmi').textContent = bmi.toFixed(1);
            document.getElementById('result-water').textContent = water;

            const goalBadge = document.getElementById('goal-badge');
            const badgeKey = 'goal_badge_' + goal;
            goalBadge.textContent = tr(badgeKey);
            goalBadge.style.color = goal === 'lose' ? '#FF4757' : (goal === 'gain' ? '#2ED573' : '#0055FF');
            goalBadge.style.background = goal === 'lose' ? 'rgba(255,71,87,0.15)' : (goal === 'gain' ? 'rgba(46,213,115,0.15)' : 'rgba(0,85,255,0.15)');
            goalBadge.style.borderColor = goal === 'lose' ? 'rgba(255,71,87,0.4)' : (goal === 'gain' ? 'rgba(46,213,115,0.4)' : 'rgba(0,85,255,0.4)');

            const marker = document.getElementById('bmi-marker');
            let markerPos = 0;
            if (bmi < 18.5) markerPos = (bmi / 18.5) * 25;
            else if (bmi < 25) markerPos = 25 + ((bmi - 18.5) / 6.5) * 25;
            else if (bmi < 30) markerPos = 50 + ((bmi - 25) / 5) * 25;
            else markerPos = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
            marker.style.left = markerPos + '%';

            const statusEl = document.getElementById('bmi-status-text');
            let statusText = '', statusColor = '', statusBg = '';
            if (bmi < 18.5) {
                statusText = tr('bmi_status_under');
                statusColor = '#4A9EFF';
                statusBg = 'rgba(74,158,255,0.1)';
            } else if (bmi < 25) {
                statusText = tr('bmi_status_normal');
                statusColor = '#2ED573';
                statusBg = 'rgba(46,213,115,0.1)';
            } else if (bmi < 30) {
                statusText = tr('bmi_status_over');
                statusColor = '#FFA502';
                statusBg = 'rgba(255,165,2,0.1)';
            } else {
                statusText = tr('bmi_status_obese');
                statusColor = '#FF4757';
                statusBg = 'rgba(255,71,87,0.1)';
            }
            statusEl.textContent = statusText;
            statusEl.style.color = statusColor;
            statusEl.style.background = statusBg;

            document.getElementById('macros-result').innerHTML = `
                <div class="macro-item">
                    <div class="macro-color" style="background:#FF4757;"></div>
                    <div class="macro-info">
                        <div class="macro-name">${tr('macros_protein')}</div>
                        <div class="macro-value" style="color:#FF4757;">${proteinG}g</div>
                    </div>
                    <div class="macro-percent">30%</div>
                </div>
                <div class="macro-item">
                    <div class="macro-color" style="background:#FFA502;"></div>
                    <div class="macro-info">
                        <div class="macro-name">${tr('macros_carbs')}</div>
                        <div class="macro-value" style="color:#FFA502;">${carbsG}g</div>
                    </div>
                    <div class="macro-percent">40%</div>
                </div>
                <div class="macro-item">
                    <div class="macro-color" style="background:#2ED573;"></div>
                    <div class="macro-info">
                        <div class="macro-name">${tr('macros_fats')}</div>
                        <div class="macro-value" style="color:#2ED573;">${fatsG}g</div>
                    </div>
                    <div class="macro-percent">30%</div>
                </div>`;

            document.getElementById('calorie-result').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('calorie-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    }

    function getFavorites() {
        try { return JSON.parse(localStorage.getItem('sharks_favs_' + (currentUser?.uid || 'guest')) || '[]'); }
        catch (e) { return []; }
    }

    function saveFavorites(f) {
        localStorage.setItem('sharks_favs_' + (currentUser?.uid || 'guest'), JSON.stringify(f));
    }

    window.toggleFavorite = function (e) {
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
            playHeartAnimation(icon, btn);
            showToast(tr('added_fav'), 'success');
        }
        saveFavorites(favs);
        if (db && currentUser) db.collection('users').doc(currentUser.uid).update({ favorites: favs }).catch(() => {});
    };

    function playHeartAnimation(icon, btn) {
        if (!btn) return;
        icon.classList.remove('heart-spring');
        void icon.offsetWidth;
        icon.classList.add('heart-spring');
        icon.classList.remove('heart-glow');
        void icon.offsetWidth;
        icon.classList.add('heart-glow');
        const ring = document.createElement('div');
        ring.className = 'heart-ring';
        btn.appendChild(ring);
        setTimeout(() => ring.remove(), 750);
        const colors = ['#FF4757', '#FFD700', '#0055FF', '#2ED573', '#FF6FB5', '#FFA502'];
        for (let i = 0; i < 10; i++) {
            const p = document.createElement('div');
            p.className = 'heart-particle';
            const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.4;
            const distance = 40 + Math.random() * 30;
            p.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
            p.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
            p.style.background = colors[i % colors.length];
            p.style.color = colors[i % colors.length];
            p.style.animationDelay = (Math.random() * 0.05) + 's';
            btn.appendChild(p);
            setTimeout(() => p.remove(), 950);
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
        bindGymCardEvents(grid);
        setupCardTilt();
    }

    function renderTop10() {
        const list = document.getElementById('top10-list');
        if (!list) return;
        const sorted = [...gyms].sort((a, b) => b.rating - a.rating).slice(0, 10);
        list.innerHTML = sorted.map((g, i) => `
            <div class="list-item" onclick="window.openGymDetails('${g.id}')">
                <span class="rank">${i + 1}</span>
                <div class="list-img" style="background-image:url('${g.cover}')"></div>
                <div class="list-info"><h3>${currentLang === 'ar' ? g.name : g.nameEn}</h3><p>${currentLang === 'ar' ? g.location : g.locationEn}</p></div>
                <div class="rating"><i class="fa-solid fa-star"></i> ${g.rating}</div>
            </div>`).join('');
    }

    async function loadProfile() {
        if (!currentUser) { showView('login'); return; }
        document.getElementById('profile-name').textContent = currentUser.name || 'User';
        document.getElementById('profile-username').textContent = '@' + (currentUser.username || 'user');
        document.getElementById('profile-avatar').textContent = (currentUser.name || 'U').charAt(0).toUpperCase();

        const badges = [];
        const joined = currentUser.createdAt?.toDate?.() || new Date();
        const daysSinceJoin = Math.floor((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceJoin < 30) badges.push({ text: tr('badge_new'), type: '' });
        else badges.push({ text: tr('badge_active'), type: 'success' });

        let userReviews = [];
        try {
            if (db) {
                const snap = await db.collection('reviews').where('userId', '==', currentUser.uid).get();
                snap.forEach(doc => userReviews.push({ id: doc.id, ...doc.data() }));
            } else {
                gyms.forEach(g => {
                    try {
                        const all = JSON.parse(localStorage.getItem('sharks_reviews_' + g.id) || '[]');
                        all.filter(r => r.userId === currentUser.uid).forEach(r => userReviews.push({ ...r, gymId: g.id }));
                    } catch (e) { }
                });
            }
        } catch (e) { console.warn(e); }

        if (userReviews.length >= 10) badges.push({ text: tr('badge_expert'), type: 'gold' });
        if (userReviews.length >= 1) badges.push({ text: tr('badge_reviewer'), type: '' });
        if (currentUser.email) badges.push({ text: tr('badge_verified'), type: 'success' });

        document.getElementById('profile-badges').innerHTML = badges.map(b =>
            `<span class="profile-badge ${b.type}">${b.text}</span>`
        ).join('');

        document.getElementById('stat-reviews').textContent = userReviews.length;
        document.getElementById('stat-favorites').textContent = getFavorites().length;
        document.getElementById('stat-joined').textContent = joined.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short' });

        const reviewsList = document.getElementById('profile-reviews-list');
        if (userReviews.length === 0) {
            reviewsList.innerHTML = `<p style="color:var(--text-muted);">${tr('no_reviews_yet')}</p>`;
        } else {
            reviewsList.innerHTML = userReviews.slice(0, 10).map(r => {
                const g = gyms.find(x => x.id === r.gymId);
                if (!g) return '';
                const stars = '★'.repeat(Math.round(r.overall || 0)) + '☆'.repeat(5 - Math.round(r.overall || 0));
                const date = r.timestamp?.toDate?.() || new Date(r.timestamp || Date.now());
                return `
                    <div class="review-card">
                        <div class="review-card-img" style="background-image:url('${g.cover}')"></div>
                        <div class="review-card-body">
                            <h4>${currentLang === 'ar' ? g.name : g.nameEn}</h4>
                            <span class="review-date">${date.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                            <div class="review-stars">${stars}</div>
                        </div>
                    </div>`;
            }).join('');
        }
    }

    function validateUsername(username) {
        if (!username || username.length < 3 || username.length > 30) return { valid: false, reason: 'length' };
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, reason: 'format' };
        return { valid: true };
    }

    async function checkUsernameAvailability(username) {
        if (!db) return { available: null };
        try {
            const doc = await db.collection('usernames').doc(username.toLowerCase()).get();
            if (!doc.exists) return { available: true };
            const data = doc.data();
            if (currentUser && data.uid === currentUser.uid) return { available: true, isCurrent: true };
            return { available: false };
        } catch (e) {
            return { available: true };
        }
    }

    function updateUsernameStatusUI(status, message) {
        const statusEl = document.getElementById('username-status');
        const hintEl = document.getElementById('username-hint');
        if (!statusEl || !hintEl) return;

        statusEl.className = 'username-status';
        hintEl.className = 'input-hint';

        if (status === 'checking') {
            statusEl.classList.add('checking');
            statusEl.innerHTML = '';
            hintEl.textContent = tr('username_checking');
        } else if (status === 'available') {
            statusEl.classList.add('available');
            statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            hintEl.textContent = tr('username_available');
            hintEl.classList.add('success');
        } else if (status === 'unavailable') {
            statusEl.classList.add('unavailable');
            statusEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
            hintEl.textContent = tr('username_taken');
            hintEl.classList.add('error');
        } else if (status === 'invalid') {
            statusEl.classList.add('unavailable');
            statusEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
            hintEl.textContent = message || tr('username_invalid');
            hintEl.classList.add('error');
        } else {
            statusEl.innerHTML = '';
            hintEl.textContent = tr('username_hint');
        }
    }

    function setupUsernameChecker() {
        const input = document.getElementById('edit-username');
        if (!input) return;
        input.addEventListener('input', function () {
            const val = this.value.trim().toLowerCase();
            if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);

            if (!val) {
                updateUsernameStatusUI('default');
                lastUsernameCheck = { username: '', available: null };
                return;
            }

            const validation = validateUsername(val);
            if (!validation.valid) {
                const msg = validation.reason === 'length' ? tr('username_length') : tr('username_format');
                updateUsernameStatusUI('invalid', msg);
                lastUsernameCheck = { username: val, available: false };
                return;
            }

            if (currentUser && val === (currentUser.username || '').toLowerCase()) {
                updateUsernameStatusUI('available');
                lastUsernameCheck = { username: val, available: true, isCurrent: true };
                return;
            }

            updateUsernameStatusUI('checking');
            lastUsernameCheck = { username: val, available: null };

            usernameCheckTimeout = setTimeout(async () => {
                const result = await checkUsernameAvailability(val);
                if (lastUsernameCheck.username === val && lastUsernameCheck.available === null) {
                    if (result.available === true) {
                        updateUsernameStatusUI('available');
                        lastUsernameCheck = { username: val, available: true };
                    } else if (result.available === false) {
                        updateUsernameStatusUI('unavailable');
                        lastUsernameCheck = { username: val, available: false };
                    } else {
                        updateUsernameStatusUI('default');
                        lastUsernameCheck = { username: val, available: true };
                    }
                }
            }, 500);
        });
    }

    window.openEditProfile = function () {
        if (!currentUser) { showToast(tr('must_login'), 'error'); showView('login'); return; }
        document.getElementById('edit-name').value = currentUser.name || '';
        document.getElementById('edit-username').value = currentUser.username || '';
        document.getElementById('edit-phone').value = currentUser.phone || '';
        document.getElementById('edit-gov').value = currentUser.gov || 'cairo';
        document.getElementById('edit-city').value = currentUser.city || '';
        updateUsernameStatusUI('default');
        lastUsernameCheck = { username: currentUser.username || '', available: true, isCurrent: true };
        document.getElementById('edit-profile-modal').classList.remove('hidden');
    };

    window.closeEditProfile = function () {
        document.getElementById('edit-profile-modal').classList.add('hidden');
    };

    async function saveProfileChanges(e) {
        e.preventDefault();
        if (!currentUser) { showToast(tr('must_login'), 'error'); return; }

        const newName = document.getElementById('edit-name').value.trim();
        const newUsername = document.getElementById('edit-username').value.trim().toLowerCase();
        const newPhone = document.getElementById('edit-phone').value.trim();
        const newGov = document.getElementById('edit-gov').value;
        const newCity = document.getElementById('edit-city').value.trim();

        if (!newName || newName.length < 3) {
            showToast(tr('name_required'), 'error');
            return;
        }
        if (!newPhone || !/^[0-9+]+$/.test(newPhone) || newPhone.length < 10) {
            showToast(tr('phone_invalid'), 'error');
            return;
        }

        const validation = validateUsername(newUsername);
        if (!validation.valid) {
            showToast(validation.reason === 'length' ? tr('username_length') : tr('username_format'), 'error');
            return;
        }

        if (!lastUsernameCheck.available && lastUsernameCheck.username === newUsername) {
            showToast(tr('username_taken'), 'error');
            return;
        }

        const submitBtn = document.querySelector('#edit-profile-form button[type="submit"]');
        submitBtn.innerHTML = '<span class="spinner"></span>';
        submitBtn.disabled = true;

        try {
            const oldUsername = (currentUser.username || '').toLowerCase();
            const usernameChanged = newUsername !== oldUsername;

            if (usernameChanged) {
                const availability = await checkUsernameAvailability(newUsername);
                if (availability.available === false) {
                    showToast(tr('username_taken'), 'error');
                    return;
                }

                if (db) {
                    const batch = db.batch();

                    if (oldUsername) {
                        batch.delete(db.collection('usernames').doc(oldUsername));
                    }
                    batch.set(db.collection('usernames').doc(newUsername), {
                        uid: currentUser.uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    const userRef = db.collection('users').doc(currentUser.uid);
                    batch.update(userRef, {
                        name: newName,
                        username: newUsername,
                        phone: newPhone,
                        gov: newGov,
                        city: newCity,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    await batch.commit();
                }
            } else {
                if (db) {
                    await db.collection('users').doc(currentUser.uid).update({
                        name: newName,
                        phone: newPhone,
                        gov: newGov,
                        city: newCity,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }

            currentUser.name = newName;
            currentUser.username = newUsername;
            currentUser.phone = newPhone;
            currentUser.gov = newGov;
            currentUser.city = newCity;

            updateProfileUI();
            showToast(usernameChanged ? tr('username_saved') : tr('profile_updated'), 'success');
            closeEditProfile();

            if (!document.getElementById('view-profile').classList.contains('hidden')) loadProfile();
        } catch (err) {
            console.error(err);
            showToast(tr('profile_error') + ': ' + (err.message || ''), 'error');
        } finally {
            submitBtn.innerHTML = tr('save');
            submitBtn.disabled = false;
        }
    }

    async function checkExistingReview() {
        if (!currentUser || !currentGymId) return null;
        const cycleId = getCycleId();
        try {
            if (db) {
                const snap = await db.collection('reviews')
                    .where('userId', '==', currentUser.uid)
                    .where('gymId', '==', currentGymId)
                    .where('cycleId', '==', cycleId)
                    .limit(1).get();
                if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
            } else {
                const all = JSON.parse(localStorage.getItem('sharks_reviews_' + currentGymId) || '[]');
                return all.find(r => r.userId === currentUser.uid && r.cycleId === cycleId) || null;
            }
        } catch (e) { console.warn(e); }
        return null;
    }

    window.openReviewModal = async function () {
        if (!currentUser) { showToast(tr('must_login'), 'error'); showView('login'); return; }
        const existing = await checkExistingReview();
        if (existing) {
            if (!confirm(tr('review_already_done'))) return;
            reviewStars = { ...existing.criteria };
        } else {
            reviewStars = { equipment: 0, cleanliness: 0, location: 0, staff: 0, organization: 0, price: 0 };
        }
        reviewPhotos = [];
        document.querySelectorAll('#review-form .stars').forEach(starsEl => {
            const crit = starsEl.getAttribute('data-crit');
            const val = reviewStars[crit] || 0;
            starsEl.innerHTML = Array(5).fill(0).map((_, i) =>
                `<span class="${i < val ? 'active' : ''}">★</span>`
            ).join('');
        });
        document.getElementById('photo-preview').innerHTML = '';
        document.getElementById('review-modal').classList.remove('hidden');
    };

    window.closeReviewModal = function () { document.getElementById('review-modal').classList.add('hidden'); };

    function setupStars() {
        document.querySelectorAll('#review-form .stars').forEach(el => {
            const crit = el.getAttribute('data-crit');
            el.addEventListener('click', function (e) {
                if (e.target.tagName !== 'SPAN') return;
                const all = this.querySelectorAll('span');
                const idx = Array.from(all).indexOf(e.target);
                reviewStars[crit] = idx + 1;
                all.forEach((s, i) => {
                    if (i <= idx) { s.classList.remove('active', 'star-animate'); void s.offsetWidth; setTimeout(() => s.classList.add('active', 'star-animate'), i * 60); }
                    else s.classList.remove('active', 'star-animate');
                });
            });
        });
    }

    function setupPhotoUpload() {
        const input = document.getElementById('review-photos');
        if (!input) return;
        input.addEventListener('change', function () {
            const remaining = 3 - reviewPhotos.length;
            const files = Array.from(this.files).slice(0, remaining);
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = (e) => compressImage(e.target.result, 800, 0.7, (compressed) => {
                    reviewPhotos.push(compressed);
                    renderPhotoPreview();
                });
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
                <button class="remove-photo" onclick="window.removePhoto(${i})"><i class="fa-solid fa-xmark"></i></button>
            </div>`).join('');
    }

    window.removePhoto = function (i) { reviewPhotos.splice(i, 1); renderPhotoPreview(); };

    function setupReviewForm() {
        const form = document.getElementById('review-form');
        if (!form) return;
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const sum = Object.values(reviewStars).reduce((a, b) => a + b, 0);
            if (sum === 0) { showToast(currentLang === 'ar' ? 'اختر نجمة على الأقل' : 'Select at least 1 star', 'error'); return; }
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = '<span class="spinner"></span>';
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
                        } catch (err) { photoUrls.push(reviewPhotos[i]); }
                    }
                } else {
                    photoUrls = [...reviewPhotos];
                }
                const cycleId = getCycleId();
                const reviewData = {
                    gymId: currentGymId, userId: currentUser.uid, username: currentUser.name,
                    criteria: { ...reviewStars }, overall: sum / 6, photos: photoUrls, cycleId: cycleId,
                    timestamp: db ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
                };
                const existing = await checkExistingReview();
                if (existing) {
                    if (db) await db.collection('reviews').doc(existing.id).update(reviewData);
                    else {
                        const key = 'sharks_reviews_' + currentGymId;
                        const all = JSON.parse(localStorage.getItem(key) || '[]');
                        const idx = all.findIndex(r => r.userId === currentUser.uid && r.cycleId === cycleId);
                        if (idx > -1) all[idx] = reviewData;
                        localStorage.setItem(key, JSON.stringify(all));
                    }
                    showToast(tr('review_updated'), 'success');
                } else {
                    if (db) await db.collection('reviews').add(reviewData);
                    else {
                        const key = 'sharks_reviews_' + currentGymId;
                        const all = JSON.parse(localStorage.getItem(key) || '[]');
                        all.push(reviewData);
                        localStorage.setItem(key, JSON.stringify(all));
                    }
                    showToast(tr('review_success'), 'success');
                }
                closeReviewModal();
            } catch (err) {
                console.error(err);
                showToast('Error: ' + err.message, 'error');
            } finally {
                btn.innerHTML = tr('submit');
                btn.disabled = false;
            }
        });
    }

    function setupLogin() {
        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) {
            googleBtn.onclick = async function () {
                if (!auth) { showToast('Firebase غير محمل - شغل على localhost', 'error'); return; }
                googleBtn.innerHTML = '<span class="spinner"></span>';
                googleBtn.disabled = true;
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
                } catch (err) {
                    console.error(err);
                    showToast(tr('login_error') + ': ' + err.message, 'error');
                } finally {
                    googleBtn.innerHTML = '<i class="fa-brands fa-google"></i> ' + tr('login_google');
                    googleBtn.disabled = false;
                }
            };
        }
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                if (!auth || !auth.currentUser) { showToast('Not authenticated', 'error'); return; }

                const newName = document.getElementById('reg-name').value.trim();
                const newUsername = document.getElementById('reg-username').value.trim().toLowerCase();
                const newPhone = document.getElementById('reg-phone').value.trim();
                const newGov = document.getElementById('reg-gov').value;
                const newCity = document.getElementById('reg-city').value.trim();

                const validation = validateUsername(newUsername);
                if (!validation.valid) {
                    showToast(validation.reason === 'length' ? tr('username_length') : tr('username_format'), 'error');
                    return;
                }

                try {
                    const usernameDoc = await db.collection('usernames').doc(newUsername).get();
                    if (usernameDoc.exists) {
                        showToast(tr('username_taken'), 'error');
                        return;
                    }

                    const newUser = {
                        name: newName,
                        username: newUsername,
                        phone: newPhone,
                        gov: newGov,
                        city: newCity,
                        email: document.getElementById('reg-email').value,
                        favorites: [],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    const batch = db.batch();
                    batch.set(db.collection('users').doc(auth.currentUser.uid), newUser);
                    batch.set(db.collection('usernames').doc(newUsername), {
                        uid: auth.currentUser.uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    await batch.commit();

                    currentUser = { uid: auth.currentUser.uid, ...newUser };
                    updateProfileUI();
                    showToast(tr('save_profile'), 'success');
                    document.getElementById('profile-section').classList.add('hidden');
                    document.getElementById('login-section').classList.remove('hidden');
                    form.reset();
                    showView('home');
                } catch (err) {
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

    window.handleProfileClick = function () {
        if (currentUser) showView('profile');
        else showView('login');
    };

    window.logout = async function () {
        try { if (auth) await auth.signOut(); } catch (e) { }
        currentUser = null;
        updateProfileUI();
        showToast(tr('logout_success'), 'info');
        showView('home');
    };

    window.requireLogin = function () {
        if (!currentUser) { showToast(tr('must_login'), 'error'); showView('login'); return false; }
        return true;
    };

    window.toggleTop3Visibility = function (cb) {
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

    window.toggleLanguage = function () {
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
        renderTop3();
        renderFilteredGyms();
        renderCompareBar();
        if (currentGymData) {
            const vIcon = currentGymData.verified ? ' <i class="fa-solid fa-circle-check verified-icon"></i>' : '';
            document.getElementById('details-title').innerHTML = `${currentLang === 'ar' ? currentGymData.name : currentGymData.nameEn}${vIcon}`;
            document.getElementById('details-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${currentLang === 'ar' ? currentGymData.location : currentGymData.locationEn}`;
            document.getElementById('details-verified').innerHTML = currentGymData.verified ? `${tr('verified')} <i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>` : tr('not_verified');
            renderCriteria();
            renderHours(currentGymData);
            renderGallery();
            animateProgressBars();
        }
        updateProfileUI();
        if (mapInstance) updateMapMarkers();
        if (!document.getElementById('view-profile').classList.contains('hidden')) loadProfile();
        showToast(tr('lang_changed'), 'info');
    };

    function setupCardTilt() {
        document.querySelectorAll('.gym-card').forEach(card => {
            if (card.dataset.tiltBound) return;
            card.dataset.tiltBound = '1';
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((y - rect.height / 2) / rect.height) * -8;
                const ry = ((x - rect.width / 2) / rect.width) * 8;
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
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    function setupParallax() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const img = document.getElementById('gallery-main-img');
                    const view = document.getElementById('view-details');
                    if (img && view && !view.classList.contains('hidden')) {
                        img.style.backgroundPositionY = `calc(50% + ${Math.min(window.scrollY * 0.15, 30)}px)`;
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

    function setupOfflineDetection() {
        const banner = document.getElementById('offline-banner');
        if (!banner) return;
        window.addEventListener('online', () => banner.classList.add('hidden'));
        window.addEventListener('offline', () => banner.classList.remove('hidden'));
        if (!navigator.onLine) banner.classList.remove('hidden');
    }

    window.addEventListener('error', (e) => { console.error('Global error:', e.error); });
    window.addEventListener('unhandledrejection', (e) => { console.error('Unhandled rejection:', e.reason); });

    window.requestUserLocation = function () {
        if (!navigator.geolocation) {
            showToast(tr('location_unsupported'), 'error');
            return;
        }
        showToast(currentLang === 'ar' ? 'جاري تحديد الموقع...' : 'Detecting location...', 'info');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                showToast(tr('location_success'), 'success');
                renderFilteredGyms();
                if (mapInstance) updateMapMarkers();
            },
            (err) => {
                console.warn('Location error:', err);
                if (currentUser && currentUser.gov) {
                    const govCoords = { cairo: { lat: 30.0444, lng: 31.2357 }, giza: { lat: 30.0131, lng: 31.2089 }, alex: { lat: 31.2001, lng: 29.9187 } };
                    if (govCoords[currentUser.gov]) {
                        userLocation = govCoords[currentUser.gov];
                        showToast(tr('location_denied'), 'info');
                        renderFilteredGyms();
                    }
                } else {
                    showToast(tr('location_error'), 'error');
                }
            },
            { timeout: 10000, maximumAge: 600000, enableHighAccuracy: false }
        );
    };

    window.openMessages = function () {
        const badge = document.getElementById('bell-badge');
        if (badge) badge.classList.add('hidden');
        localStorage.setItem('messages_read', 'true');
        showView('messages');
        document.querySelectorAll('#messages-container .message-item.unread').forEach(el => el.classList.remove('unread'));
    };

    function checkUnreadMessages() {
        const badge = document.getElementById('bell-badge');
        if (!badge) return;
        const isRead = localStorage.getItem('messages_read') === 'true';
        if (isRead) badge.classList.add('hidden');
        else badge.classList.remove('hidden');
    }

    async function loadGymsFromFirestore() {
        if (!db) return;
        try {
            const snap = await db.collection('gyms').limit(100).get();
            if (!snap.empty) {
                const loaded = [];
                snap.forEach(doc => loaded.push({ id: doc.id, ...doc.data() }));
                if (loaded.length > 0) {
                    for (let i = 0; i < loaded.length; i++) {
                        if (!loaded[i].cover && loaded[i].images && loaded[i].images.length > 0) loaded[i].cover = loaded[i].images[0];
                    }
                    gyms.length = 0;
                    gyms.push(...loaded);
                }
            }
        } catch (e) { console.warn('Firestore load failed, using mock:', e); }
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
                    } catch (e) { }
                } else {
                    currentUser = null;
                    updateProfileUI();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', async function () {
        showSkeletons();
        setupSearch();
        setupCalculator();
        setupLogin();
        setupMobileMenu();
        setupStars();
        setupReviewForm();
        setupPhotoUpload();
        setupPriceSliders();
        setupImageProtection();
        setupSwipe();
        setupOfflineDetection();
        setupUsernameChecker();
        loadState();
        updateProfileUI();
        checkUnreadMessages();

        const editForm = document.getElementById('edit-profile-form');
        if (editForm) editForm.addEventListener('submit', saveProfileChanges);

        await loadGymsFromFirestore();

        setTimeout(() => {
            renderTop3();
            renderFilteredGyms();
            setupCardTilt();
            setupMagneticButtons();
            setupParallax();
        }, 700);

        setTimeout(handleDeepLink, 800);
        window.addEventListener('popstate', handleDeepLink);

        console.log('SHARKS App Ready');
    });

})();
