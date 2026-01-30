import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LOCALES = ['tr', 'en'];

export const getLocaleFromPath = (pathname) => {
  if (!pathname) return 'en';
  const firstSegment = pathname.split('/')[1];
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    return firstSegment;
  }
  return 'en';
};

export const buildLocaleUrl = (pathname, search, hash, targetLocale) => {
  const safePath = pathname || '/';
  const segments = safePath.split('/').filter(s => s !== ''); // Remove empty segments
  
  // If first segment is a locale, replace it
  if (segments.length > 0 && (segments[0] === 'tr' || segments[0] === 'en')) {
    segments[0] = targetLocale;
    const newPath = `/${segments.join('/')}`;
    return `${newPath}${search || ''}${hash || ''}`;
  }

  // If path is root or empty, just add locale
  if (safePath === '/' || safePath === '' || segments.length === 0) {
    return `/${targetLocale}${search || ''}${hash || ''}`;
  }

  // Otherwise, prepend locale
  return `/${targetLocale}${safePath}${search || ''}${hash || ''}`;
};

const getInitialLocale = () => {
  if (typeof window === 'undefined') return 'en';
  return getLocaleFromPath(window.location.pathname);
};

const resources = {
  tr: {
    translation: {
      common: {
        loading: 'Yükleniyor...'
      },
      nav: {
        home: 'Ana Sayfa',
        support: 'Duygusal Destek',
        memoryList: 'Hafıza Listesi',
        editProfile: 'Profili Düzenle',
        clearData: 'Geçmişi Temizle',
        logout: 'Çıkış Yap',
        login: 'Giriş Yap',
        loginLower: 'Giriş yap'
      },
      language: {
        switchToEnglish: 'İngilizceye geç',
        switchToTurkish: 'Türkçeye geç'
      },
      footer: {
        privacy: 'Gizlilik Politikası',
        copyright: '© {{year}} TherapyAI. Tüm hakları saklıdır.'
      },
      home: {
        title: "TherapyAI'a Hoş Geldiniz",
        lead: 'Gelişmiş yapay zeka ve şefkatli bakımın buluştuğu destekleyici bir alan keşfedin. Daha iyi bir ruh sağlığına giden yolculuğunuz burada başlıyor.',
        cta: 'Seansınızı Başlatın',
        helpTitle: 'Nasıl Yardımcı Olabiliriz',
        emotionalTitle: 'Duygusal Destek',
        emotionalDesc: 'Hayatın zorluklarını güvenle aşmanıza yardımcı olacak 7/24 rehberlik.',
        cognitiveTitle: 'Bilişsel Teknikler',
        cognitiveDesc: 'Düşünceleri yeniden şekillendirmek ve zihinsel refahı artırmak için pratik beceriler öğrenin.',
        personalTitle: 'Kişiselleştirilmiş Yaklaşım',
        personalDesc: 'Benzersiz ihtiyaç ve tercihlerinize göre uyarlanmış yapay zeka destekli rehberlik.'
      },
      auth: {
        titles: {
          login: 'Giriş Yap',
          signup: 'Hesap Oluştur',
          forgotPassword: 'Şifre Sıfırlama',
          changePassword: 'Yeni Şifre Belirle',
          verifyEmail: 'E-posta Doğrulama'
        },
        labels: {
          name: 'Ad Soyad',
          email: 'E-posta',
          password: 'Parola',
          confirmPassword: 'Parolayı Onaylayın',
          currentPassword: 'Mevcut Şifre',
          newPassword: 'Yeni Şifre',
          confirmNewPassword: 'Yeni Şifre (Tekrar)',
          deletePassword: 'Devam etmek için şifrenizi girin:'
        },
        placeholders: {
          email: 'E-posta adresiniz',
          fullName: 'Ad Soyad',
          currentPassword: 'Mevcut şifreniz',
          newPassword: 'Yeni şifre',
          confirmNewPassword: 'Yeni şifre tekrar',
          passwordMin6: 'En az 6 karakter'
        },
        actions: {
          login: 'Giriş Yap',
          loginLoading: 'Giriş yapılıyor...',
          signup: 'Kayıt Ol',
          signupLoading: 'Hesap oluşturuluyor...',
          resetPassword: 'Şifre Sıfırla',
          resetPasswordLoading: 'Gönderiliyor...',
          updatePassword: 'Şifreyi Güncelle',
          updatePasswordLoading: 'Güncelleniyor...',
          resendVerification: 'Doğrulama E-postasını Tekrar Gönder',
          resendVerificationLoading: 'Gönderiliyor...'
        },
        links: {
          forgotPassword: 'Parolamı Unuttum',
          backToLogin: 'Giriş sayfasına dön',
          noAccount: 'Hesabınız yok mu?',
          haveAccount: 'Zaten bir hesabınız var mı?',
          signup: 'Kayıt Ol',
          login: 'Giriş Yap',
          requestResetLink: 'Yeni sıfırlama bağlantısı iste'
        },
        showHide: {
          showPassword: 'Şifreyi göster',
          hidePassword: 'Şifreyi gizle'
        },
        messages: {
          emailVerifiedSuccess: 'E-posta adresiniz doğrulandı! Şimdi giriş yapabilirsiniz.',
          requireVerification: 'E-posta adresiniz doğrulanmadan bu sayfaya erişemezsiniz.',
          resendSuccess: 'Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.',
          resendError: 'Doğrulama e-postası gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          invalidEmail: "Lütfen e-posta adresine bir '@' ekleyin",
          unverifiedEmail: 'E-posta adresiniz henüz doğrulanmadı. Lütfen önce e-posta adresinizi doğrulayın.',
          invalidCredentials: 'Geçersiz e-posta veya parola',
          tooManyRequests: 'Çok fazla deneme. Daha sonra tekrar deneyin',
          loginFailed: 'Giriş başarısız',
          passwordMismatch: 'Parolalar eşleşmiyor',
          passwordMinLength: 'Parola en az 6 karakter olmalıdır',
          signupSuccess: 'Hesabınız oluşturuldu! Lütfen e-posta adresinizi doğrulamak için gönderdiğimiz bağlantıya tıklayın.',
          emailInUse: 'Bu e-posta adresi zaten kullanımda',
          weakPassword: 'Parola çok zayıf',
          networkError: 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
          signupFailed: 'Hesap oluşturma başarısız oldu: {{error}}',
          resetSent: 'E-posta adresiniz sistemde kayıtlı ise şifre sıfırlama bağlantısı gönderilecektir. Lütfen gelen kutunuzu kontrol edin.',
          resetFailed: 'Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin.',
          resetNetworkError: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
          invalidResetLink: 'Geçersiz şifre sıfırlama bağlantısı. Lütfen yeni bir şifre sıfırlama bağlantısı isteyin.',
          invalidVerificationLink: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.',
          expiredResetLink: 'Bu şifre sıfırlama bağlantısının süresi dolmuş veya geçersiz. Lütfen yeni bir bağlantı isteyin.',
          resetSuccess: 'Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...',
          verifyInProgress: 'E-posta adresiniz doğrulanıyor...',
          verifySuccess: 'E-posta adresiniz başarıyla doğrulandı!',
          redirectingToApp: 'Uygulamaya yönlendiriliyorsunuz...',
          redirectingToLogin: 'Giriş sayfasına yönlendiriliyorsunuz...',
          verifyFailed: 'E-posta doğrulama işlemi başarısız oldu. Bağlantı geçersiz veya süresi dolmuş olabilir.'
        },
        verification: {
          notVerified: 'E-posta adresiniz ({{email}}) henüz doğrulanmadı.',
          requiresVerification: 'Korumalı sayfalara erişim için e-posta doğrulaması gerekmektedir.'
        }
      },
      chat: {
        authRequiredTitle: "TherapyAI'a Hoş Geldiniz",
        authRequiredDesc1: 'Duygusal destek ve zihinsel iyi oluş konusunda size yardımcı olmak için buradayız.',
        authRequiredDesc2: 'Sohbeti kullanmak için lütfen giriş yapın veya kaydolun.',
        newConversation: 'Yeni Konuşma',
        typing: 'Yazıyor...',
        emptyTitle: "TherapyAI'a Hoş Geldiniz",
        emptyDesc1: 'Duygusal destek ve zihinsel iyi oluş konusunda size yardımcı olmak için buradayım.',
        emptyDesc2: 'Konuşmaya başlamak için bir mesaj gönderin veya sol menüden önceki bir konuşmayı seçin.',
        inputPlaceholder: 'Mesaj yazın...',
        send: 'Gönder',
        sending: 'Gönderiliyor...',
        feedbackButtonTitle: 'Bu yanıt hakkında geri bildirim ver',
        memoryEnabledTitle: 'Hafıza etkin',
        memoryDisabledTitle: 'Hafıza devre dışı',
        errorMessage: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        feedbackSuccess: 'Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!',
        memoryDuplicate: 'Bu bilgiyi zaten hafızamda tutuyorum. Benzer bir kayıt mevcut, bu yüzden tekrar kaydetmiyorum.',
        memoryLimit: 'Maalesef hafıza limitine ulaştım. Yeni bilgileri kaydetmeden önce bazı eski konuları temizlemen gerekiyor.'
      },
      memory: {
        listTitle: 'Hafıza Listesi',
        listDescription: 'Daha önce kaydedilen tüm anıları burada görebilir ve yönetebilirsiniz.',
        managerTitle: 'Hafıza Yöneticisi',
        enabled: 'Hafıza Etkin',
        disabled: 'Hafıza Devre Dışı',
        searchPlaceholder: 'Hafızada ara...',
        searchButton: 'Ara',
        searchLoading: 'Aranıyor...',
        tabRecent: 'Son Eklenenler',
        tabImportant: 'Önemli',
        tabSearch: 'Arama Sonuçları',
        disabledTitle: 'Hafıza özelliği şu anda devre dışı.',
        disabledHint: 'Saklanan hafızaları görüntülemek, aramak ve yönetmek için hafızayı etkinleştirin.',
        noSearchResults: 'Arama sonucu bulunamadı.',
        noMemories: 'Henüz hafıza kayıtlı değil.',
        importance: 'Önem',
        reasonLabel: 'Neden önemli:',
        createdAt: 'Oluşturulma',
        recallCount: '{{count}} kez hatırlandı',
        deleteTitle: 'Bu hafızayı sil',
        unknownDate: 'Bilinmeyen tarih',
        invalidDate: 'Geçersiz tarih'
      },
      conversation: {
        title: 'Konuşmalarım',
        close: 'Kapat',
        loading: 'Yükleniyor...',
        noConversations: 'Henüz konuşma bulunmuyor.',
        startNewHint: 'Yeni bir konuşma başlatmak için mesaj gönderin.',
        deleteConfirm: 'Bu konuşmayı silmek istediğinizden emin misiniz?',
        deleteError: 'Konuşmayı silerken bir hata oluştu. Lütfen tekrar deneyin.',
        newConversation: 'Yeni Konuşma',
        today: 'Bugün',
        yesterday: 'Dün',
        daysAgo: '{{count}} gün önce',
        loadingMore: 'Daha fazla yükleniyor...',
        deleteAria: 'Konuşmayı Sil'
      },
      feedback: {
        title: 'AI Yanıtı Hakkında Geri Bildirim',
        userMessage: 'Mesajınız:',
        aiMessage: 'AI Yanıtı:',
        reasonLabel: 'Sorun türü nedir?',
        descriptionLabel: 'Detaylı açıklama (zorunlu):',
        descriptionPlaceholder: 'Lütfen sorunu veya önerinizi detaylı olarak açıklayın...',
        cancel: 'İptal',
        submit: 'Geri Bildirim Gönder',
        submitting: 'Gönderiliyor...',
        reasonRequired: 'Lütfen bir sebep seçin.',
        descriptionRequired: 'Lütfen açıklama yazın.',
        submitError: 'Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
        reasons: {
          inappropriate: 'Uygunsuz İçerik',
          notEnough: 'Yetersiz Yanıt',
          incorrect: 'Yanlış Bilgi',
          unhelpful: 'Yardımcı Değil',
          tooGeneric: 'Çok Genel',
          offTopic: 'Konuyla İlgisiz',
          technical: 'Teknik Sorun',
          other: 'Diğer'
        }
      },
      profile: {
        title: 'Profili Düzenle',
        userInfo: 'Kullanıcı Bilgileri',
        passwordSection: 'Şifre Değiştir',
        emailImmutable: 'E-posta adresi değiştirilemez',
        passwordNote: 'Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.',
        cancel: 'İptal',
        save: 'Kaydet',
        saving: 'Kaydediliyor...',
        loadError: 'Kullanıcı bilgileri yüklenemedi.',
        updateSuccess: 'Profiliniz başarıyla güncellendi.',
        updateError: 'Profil güncellenirken bir hata oluştu: {{error}}',
        currentPasswordRequired: 'Şifre değiştirmek için mevcut şifrenizi girmelisiniz.',
        newPasswordsMismatch: 'Yeni şifreler eşleşmiyor.',
        wrongPassword: 'Mevcut şifre yanlış.',
        weakPassword: 'Şifre çok zayıf. Daha güçlü bir şifre seçin.',
        requiresRecentLogin: 'Güvenlik nedeniyle lütfen çıkış yapıp tekrar giriş yapın, sonra şifrenizi değiştirin.',
        passwordUpdateError: 'Şifre güncellenirken bir hata oluştu. Mevcut şifrenizi doğru girdiğinizden emin olun.',
        passwordMinLength: 'Şifreniz en az 6 karakterden oluşmalı.',
        passwordMaxLength: 'Şifreniz en fazla 128 karakter olabilir.',
        deleteSectionTitle: 'Hesap Silme',
        deleteSectionSubtitle: 'Bu işlem geri alınamaz ve kalıcıdır',
        deleteConfirmPrompt: 'Bu işlem geri alınamaz! Hesabınızı ve tüm verilerinizi kalıcı olarak silecektir. Devam etmek istediğinizden emin misiniz?',
        deleteInfoTitle: 'Hesabınızı sildiğinizde:',
        deleteList: {
          conversations: 'Tüm konuşma geçmişiniz silinir',
          memories: 'Kaydedilen hatıralarınız silinir',
          profile: 'Profil bilgileriniz silinir',
          access: 'Bu hesaba bir daha erişemezsiniz'
        },
        deleteWarning: 'Bu işlem geri alınamaz!',
        deleteButton: 'Hesabı Kalıcı Olarak Sil',
        deleteModalTitle: 'Hesabı Kalıcı Olarak Sil',
        deleteModalWarning: 'Bu işlem geri alınamaz! Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.',
        deleteDataTitle: 'Silinecek veriler:',
        deleteData: {
          chatHistory: 'Tüm konuşma geçmişi',
          memories: 'Kaydedilen hatıralar',
          profile: 'Profil bilgileri',
          accountSettings: 'Hesap ayarları'
        },
        deletePasswordPrompt: 'Devam etmek için şifrenizi girin:',
        deleteCancel: 'İptal Et',
        deleteConfirm: 'Hesabı Sil',
        deleting: 'Siliniyor...',
        deleteSuccessAlert: 'Hesap verileriniz başarıyla silindi ve oturumunuz kapatıldı.',
        deleteError: 'Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.',
        deleteWrongPassword: 'Şifre yanlış. Lütfen doğru şifrenizi girin.',
        deleteRequiresRecentLogin: 'Güvenlik nedeniyle lütfen çıkış yapıp tekrar giriş yapın, sonra hesabınızı silin.'
      },
      clearData: {
        title: 'Veri Yönetimi',
        subtitle: 'Sohbet geçmişinizi ve hatıralarınızı yönetin',
        errorTitle: 'Hata Oluştu',
        sessionMissing: 'Kullanıcı oturumu bulunamadı.',
        deleteSuccess: 'Sohbet geçmişiniz ve hatıralarınız başarıyla temizlendi.',
        deleteError: 'Veriler silinirken bir hata oluştu. Lütfen tekrar deneyin.',
        deleteConfirmPrompt: 'Bu işlem geri alınamaz! Tüm sohbet geçmişiniz ve hatıralarınız kalıcı olarak silinecektir. Devam etmek istediğinizden emin misiniz?',
        whatDeleted: 'Ne Silinecek?',
        whatDeletedItems: {
          chatHistory: 'Tüm sohbet geçmişiniz',
          memories: 'Kaydedilen hatıralarınız',
          conversations: 'Konuşma verileriniz'
        },
        whatPreserved: 'Ne Korunacak?',
        whatPreservedItems: {
          account: 'Hesap bilgileriniz',
          profile: 'Profil ayarlarınız',
          login: 'Giriş bilgileriniz'
        },
        warningTitle: 'Önemli Uyarı',
        warningLine1: 'Bu işlem geri alınamaz. Silinen veriler hiçbir şekilde kurtarılamaz.',
        warningLine2: 'Devam etmeden önce bu kararınızdan emin olduğunuzdan emin olun.',
        clearButton: 'Tüm Verileri Temizle',
        clearing: 'Veriler Temizleniyor...',
        confirmTitle: 'Son Onay',
        confirmMessage: 'Bu işlemle tüm sohbet geçmişiniz ve hatıralarınız kalıcı olarak silinecek.',
        confirmWarning: 'Bu işlem geri alınamaz!',
        cancel: 'İptal Et',
        confirmYes: 'Evet, Sil',
        deleting: 'Siliniyor...'
      },
      firebase: {
        redirecting: 'Yönlendiriliyor...'
      }
    }
  },
  en: {
    translation: {
      common: {
        loading: 'Loading...'
      },
      nav: {
        home: 'Home',
        support: 'Emotional Support',
        memoryList: 'Memory List',
        editProfile: 'Edit Profile',
        clearData: 'Clear History',
        logout: 'Log Out',
        login: 'Log In',
        loginLower: 'Log in'
      },
      language: {
        switchToEnglish: 'Switch to English',
        switchToTurkish: 'Switch to Turkish'
      },
      footer: {
        privacy: 'Privacy Policy',
        copyright: '© {{year}} TherapyAI. All rights reserved.'
      },
      home: {
        title: 'Welcome to TherapyAI',
        lead: 'Discover a supportive space where advanced AI and compassionate care meet. Your journey to better mental health starts here.',
        cta: 'Start Your Session',
        helpTitle: 'How We Can Help',
        emotionalTitle: 'Emotional Support',
        emotionalDesc: '24/7 guidance to help you navigate life’s challenges with confidence.',
        cognitiveTitle: 'Cognitive Techniques',
        cognitiveDesc: 'Learn practical skills to reframe thoughts and enhance mental well-being.',
        personalTitle: 'Personalized Approach',
        personalDesc: 'AI-guided support tailored to your unique needs and preferences.'
      },
      auth: {
        titles: {
          login: 'Log In',
          signup: 'Create Account',
          forgotPassword: 'Reset Password',
          changePassword: 'Set New Password',
          verifyEmail: 'Email Verification'
        },
        labels: {
          name: 'Full Name',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          currentPassword: 'Current Password',
          newPassword: 'New Password',
          confirmNewPassword: 'Confirm New Password',
          deletePassword: 'Enter your password to continue:'
        },
        placeholders: {
          email: 'Your email address',
          fullName: 'Full Name',
          currentPassword: 'Your current password',
          newPassword: 'New password',
          confirmNewPassword: 'Repeat new password',
          passwordMin6: 'At least 6 characters'
        },
        actions: {
          login: 'Log In',
          loginLoading: 'Logging in...',
          signup: 'Sign Up',
          signupLoading: 'Creating account...',
          resetPassword: 'Reset Password',
          resetPasswordLoading: 'Sending...',
          updatePassword: 'Update Password',
          updatePasswordLoading: 'Updating...',
          resendVerification: 'Resend Verification Email',
          resendVerificationLoading: 'Sending...'
        },
        links: {
          forgotPassword: 'Forgot Password',
          backToLogin: 'Back to login',
          noAccount: "Don't have an account?",
          haveAccount: 'Already have an account?',
          signup: 'Sign Up',
          login: 'Log In',
          requestResetLink: 'Request a new reset link'
        },
        showHide: {
          showPassword: 'Show password',
          hidePassword: 'Hide password'
        },
        messages: {
          emailVerifiedSuccess: 'Your email has been verified! You can now log in.',
          requireVerification: 'You cannot access this page without verifying your email.',
          resendSuccess: 'Verification email resent. Please check your inbox.',
          resendError: 'An error occurred while sending the verification email. Please try again later.',
          invalidEmail: "Please include an '@' in the email address.",
          unverifiedEmail: 'Your email is not verified yet. Please verify your email first.',
          invalidCredentials: 'Invalid email or password',
          tooManyRequests: 'Too many attempts. Please try again later',
          loginFailed: 'Login failed',
          passwordMismatch: 'Passwords do not match',
          passwordMinLength: 'Password must be at least 6 characters',
          signupSuccess: 'Your account was created! Please verify your email using the link we sent.',
          emailInUse: 'This email is already in use',
          weakPassword: 'Password is too weak',
          networkError: 'Network error. Please check your internet connection.',
          signupFailed: 'Account creation failed: {{error}}',
          resetSent: 'If your email is registered, a reset link will be sent. Please check your inbox.',
          resetFailed: 'Password reset failed. Please try again.',
          resetNetworkError: 'Network error. Please check your internet connection.',
          invalidResetLink: 'Invalid reset link. Please request a new reset email.',
          invalidVerificationLink: 'Invalid or expired verification link.',
          expiredResetLink: 'This reset link is expired or invalid. Please request a new link.',
          resetSuccess: 'Your password was updated successfully. Redirecting to login...',
          verifyInProgress: 'Verifying your email...',
          verifySuccess: 'Your email has been verified!',
          redirectingToApp: 'Redirecting to app...',
          redirectingToLogin: 'Redirecting to login...',
          verifyFailed: 'Email verification failed. The link may be invalid or expired.'
        },
        verification: {
          notVerified: 'Your email ({{email}}) is not verified yet.',
          requiresVerification: 'Email verification is required to access protected pages.'
        }
      },
      chat: {
        authRequiredTitle: 'Welcome to TherapyAI',
        authRequiredDesc1: 'We are here to help with emotional support and mental well-being.',
        authRequiredDesc2: 'Please log in or sign up to use the chat.',
        newConversation: 'New Conversation',
        typing: 'Typing...',
        emptyTitle: 'Welcome to TherapyAI',
        emptyDesc1: 'I am here to help with emotional support and mental well-being.',
        emptyDesc2: 'Send a message to start chatting or select a previous conversation from the left menu.',
        inputPlaceholder: 'Type a message...',
        send: 'Send',
        sending: 'Sending...',
        feedbackButtonTitle: 'Give feedback about this response',
        memoryEnabledTitle: 'Memory enabled',
        memoryDisabledTitle: 'Memory disabled',
        errorMessage: 'An error occurred. Please try again later.',
        feedbackSuccess: 'Your feedback was sent successfully. Thank you!',
        memoryDuplicate: 'I already have this information in memory. A similar record exists, so I am not saving it again.',
        memoryLimit: 'I have reached my memory limit. Please clear some old topics before saving new information.'
      },
      memory: {
        listTitle: 'Memory List',
        listDescription: 'You can view and manage all saved memories here.',
        managerTitle: 'Memory Manager',
        enabled: 'Memory Enabled',
        disabled: 'Memory Disabled',
        searchPlaceholder: 'Search memories...',
        searchButton: 'Search',
        searchLoading: 'Searching...',
        tabRecent: 'Recently Added',
        tabImportant: 'Important',
        tabSearch: 'Search Results',
        disabledTitle: 'Memory feature is currently disabled.',
        disabledHint: 'Enable memory to view, search, and manage saved memories.',
        noSearchResults: 'No results found.',
        noMemories: 'No memories saved yet.',
        importance: 'Importance',
        reasonLabel: 'Why important:',
        createdAt: 'Created',
        recallCount: 'Recalled {{count}} times',
        deleteTitle: 'Delete this memory',
        unknownDate: 'Unknown date',
        invalidDate: 'Invalid date'
      },
      conversation: {
        title: 'My Conversations',
        close: 'Close',
        loading: 'Loading...',
        noConversations: 'No conversations yet.',
        startNewHint: 'Send a message to start a new conversation.',
        deleteConfirm: 'Are you sure you want to delete this conversation?',
        deleteError: 'An error occurred while deleting the conversation. Please try again.',
        newConversation: 'New Conversation',
        today: 'Today',
        yesterday: 'Yesterday',
        daysAgo: '{{count}} days ago',
        loadingMore: 'Loading more...',
        deleteAria: 'Delete conversation'
      },
      feedback: {
        title: 'Feedback About AI Response',
        userMessage: 'Your message:',
        aiMessage: 'AI response:',
        reasonLabel: 'What is the issue?',
        descriptionLabel: 'Detailed description (required):',
        descriptionPlaceholder: 'Please describe the issue or your suggestion in detail...',
        cancel: 'Cancel',
        submit: 'Send Feedback',
        submitting: 'Sending...',
        reasonRequired: 'Please select a reason.',
        descriptionRequired: 'Please enter a description.',
        submitError: 'An error occurred while sending feedback. Please try again.',
        reasons: {
          inappropriate: 'Inappropriate Content',
          notEnough: 'Insufficient Response',
          incorrect: 'Incorrect Information',
          unhelpful: 'Not Helpful',
          tooGeneric: 'Too Generic',
          offTopic: 'Off Topic',
          technical: 'Technical Issue',
          other: 'Other'
        }
      },
      profile: {
        title: 'Edit Profile',
        userInfo: 'User Information',
        passwordSection: 'Change Password',
        emailImmutable: 'Email address cannot be changed',
        passwordNote: "Leave these fields blank if you don't want to change your password.",
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Saving...',
        loadError: 'Failed to load user information.',
        updateSuccess: 'Your profile has been updated successfully.',
        updateError: 'An error occurred while updating your profile: {{error}}',
        currentPasswordRequired: 'You must enter your current password to change it.',
        newPasswordsMismatch: 'New passwords do not match.',
        wrongPassword: 'Current password is incorrect.',
        weakPassword: 'Password is too weak. Please choose a stronger password.',
        requiresRecentLogin: 'For security, please log out and log back in, then change your password.',
        passwordUpdateError: 'An error occurred while updating the password. Please make sure your current password is correct.',
        passwordMinLength: 'Your password must be at least 6 characters.',
        passwordMaxLength: 'Your password can be at most 128 characters.',
        deleteSectionTitle: 'Delete Account',
        deleteSectionSubtitle: 'This action is irreversible and permanent',
        deleteConfirmPrompt: 'This action cannot be undone! Your account and all data will be permanently deleted. Are you sure you want to continue?',
        deleteInfoTitle: 'When you delete your account:',
        deleteList: {
          conversations: 'All chat history will be deleted',
          memories: 'Saved memories will be deleted',
          profile: 'Profile information will be deleted',
          access: 'You will lose access to this account'
        },
        deleteWarning: 'This action cannot be undone!',
        deleteButton: 'Permanently Delete Account',
        deleteModalTitle: 'Permanently Delete Account',
        deleteModalWarning: 'This action cannot be undone. Your account and all data will be deleted permanently.',
        deleteDataTitle: 'Data to be deleted:',
        deleteData: {
          chatHistory: 'All chat history',
          memories: 'Saved memories',
          profile: 'Profile information',
          accountSettings: 'Account settings'
        },
        deletePasswordPrompt: 'Enter your password to continue:',
        deleteCancel: 'Cancel',
        deleteConfirm: 'Delete Account',
        deleting: 'Deleting...',
        deleteSuccessAlert: 'Your account data has been deleted and you have been signed out.',
        deleteError: 'An error occurred while deleting the account. Please try again.',
        deleteWrongPassword: 'Incorrect password. Please enter your correct password.',
        deleteRequiresRecentLogin: 'For security, please log out and log back in, then delete your account.'
      },
      clearData: {
        title: 'Data Management',
        subtitle: 'Manage your chat history and memories',
        errorTitle: 'An Error Occurred',
        sessionMissing: 'User session not found.',
        deleteSuccess: 'Your chat history and memories have been cleared successfully.',
        deleteError: 'An error occurred while deleting data. Please try again.',
        deleteConfirmPrompt: 'This action cannot be undone! All your chat history and memories will be permanently deleted. Are you sure you want to proceed?',
        whatDeleted: 'What Will Be Deleted?',
        whatDeletedItems: {
          chatHistory: 'All chat history',
          memories: 'Saved memories',
          conversations: 'Conversation data'
        },
        whatPreserved: 'What Will Be Preserved?',
        whatPreservedItems: {
          account: 'Account information',
          profile: 'Profile settings',
          login: 'Login credentials'
        },
        warningTitle: 'Important Warning',
        warningLine1: 'This action is irreversible. Deleted data cannot be recovered.',
        warningLine2: 'Please be sure of your decision before proceeding.',
        clearButton: 'Clear All Data',
        clearing: 'Clearing data...',
        confirmTitle: 'Final Confirmation',
        confirmMessage: 'This will permanently delete all your chat history and memories.',
        confirmWarning: 'This action cannot be undone!',
        cancel: 'Cancel',
        confirmYes: 'Yes, Delete',
        deleting: 'Deleting...'
      },
      firebase: {
        redirecting: 'Redirecting...'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLocale(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language;
  });
}

export default i18n;
