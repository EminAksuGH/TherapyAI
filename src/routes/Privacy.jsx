import React from 'react';
import styles from './Privacy.module.css';
import { useTranslation } from 'react-i18next';

const TurkishPrivacy = () => (
  <div className={styles.container}>
    <div className={styles.content}>
      <h1 className={styles.title}>Gizlilik Politikası</h1>
      <p className={styles.lastUpdated}>Son güncelleme: 06.09.2025</p>

      <div className={styles.card}>
        <p>
          Bu politika, <strong>TherapyAI</strong> mobil ve web uygulamalarını ("Uygulama") kullanırken
          kişisel verilerinizin nasıl işlendiğini açıklar. Veri sorumlusu: <strong>TherapyAI</strong> – 
          İletişim: <a href="mailto:eminaksu@esydelabs.com">eminaksu@esydelabs.com</a>.
        </p>

        <h2>Topladığımız Veriler</h2>
        <ul>
          <li><strong>Hesap bilgileri:</strong> e‑posta adresi, e‑posta doğrulama durumu.</li>
          <li><strong>Uygulama verileri:</strong> oluşturduğunuz konuşmalar ve mesajlar, hatıralar, geri bildirimler.</li>
          <li><strong>Teknik veriler:</strong> cihaz/uygulama sürümü, çökme/hata kayıtları, anonim kullanım ölçümleri.</li>
        </ul>

        <h2>İşleme Amaçlarımız</h2>
        <ul>
          <li>Hizmeti sağlamak, konuşmaları senkronize etmek ve deneyimi kişiselleştirmek.</li>
          <li>Hesap güvenliği (e‑posta doğrulaması, kötüye kullanımın önlenmesi).</li>
          <li>Hata ayıklama, güvenlik ve ürün geliştirme.</li>
        </ul>

        <h2>Hukuki Dayanak</h2>
        <p>KVKK m.5/2‑c (sözleşmenin ifası) ve m.5/2‑f (meşru menfaat). Gerekli hallerde açık rıza alınır.</p>

        <h2>Üçüncü Taraflar</h2>
        <p>
          Veri işleyici olarak Google Firebase (Authentication, Cloud Firestore) kullanılır.
          Veriler reklam amacıyla paylaşılmaz ya da satılmaz.
        </p>

        <h2>Veri Güvenliği</h2>
        <p>Veriler aktarım sırasında ve depoda şifrelenir. Erişimler rol bazlı olarak sınırlandırılır.</p>

        <h2>Saklama Süreleri</h2>
        <p>
          Hesabınız açık kaldıkça verileriniz saklanır. <strong>Hesabınızı sildiğinizde</strong>{' '}
          konuşmalarınız, mesajlarınız, hatıralarınız ve kullanıcı kaydınız kalıcı olarak silinir.
        </p>

        <h2>Kullanıcı Kontrolleri</h2>
        <ul>
          <li>
            <strong>Sohbet Geçmişi ve Hatıraları Temizleme:</strong> Hesabınızı silmeden de uygulama içindeki{' '}
            <em>Geçmişi Temizle</em> seçeneği ile tüm konuşmalarınızı, mesajlarınızı ve
            hatıralarınızı kalıcı olarak silebilirsiniz.
          </li>
          <li>
            <strong>Hesap Silme:</strong> Profil &gt; Profili Düzenle &gt; Hesabı Kalıcı Olarak Sil
            adımlarını izleyerek tüm verilerinizi silebilirsiniz.
          </li>
        </ul>

        <h2>Haklarınız</h2>
        <p>
          Erişim, düzeltme, silme, itiraz ve şikâyet haklarınızı{' '}
          <a href="mailto:eminaksu@esydelabs.com">eminaksu@esydelabs.com</a> üzerinden kullanabilirsiniz.
        </p>

        <h2>Çocukların Gizliliği</h2>
        <p>Uygulama 13 yaş altına yönelik değildir.</p>

        <h2>Değişiklikler</h2>
        <p>Bu politika zaman zaman güncellenebilir. Güncel sürüm bu sayfada yayımlanır.</p>

        <h2>İletişim</h2>
        <p>
          <a href="mailto:eminaksu@esydelabs.com">eminaksu@esydelabs.com</a>
        </p>
      </div>
    </div>
  </div>
);

const EnglishPrivacy = () => (
  <div className={styles.container}>
    <div className={styles.content}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.lastUpdated}>Last updated: 06.09.2025</p>

      <div className={styles.card}>
        <p>
          This policy explains how your personal data is processed when using the <strong>TherapyAI</strong>{' '}
          mobile and web applications (the "App"). Data controller: <strong>TherapyAI</strong> – 
          Contact: <a href="mailto:eminaksu@esydelabs.com">eminaksu@esydelabs.com</a>.
        </p>

        <h2>Data We Collect</h2>
        <ul>
          <li><strong>Account information:</strong> email address, email verification status.</li>
          <li><strong>App data:</strong> conversations and messages you create, memories, feedback.</li>
          <li><strong>Technical data:</strong> device/app version, crash/error logs, anonymized usage metrics.</li>
        </ul>

        <h2>Purposes of Processing</h2>
        <ul>
          <li>Provide the service, synchronize conversations, and personalize your experience.</li>
          <li>Account security (email verification, abuse prevention).</li>
          <li>Debugging, security, and product improvement.</li>
        </ul>

        <h2>Legal Basis</h2>
        <p>Applicable under contractual necessity and legitimate interest. Where required, explicit consent is obtained.</p>

        <h2>Third Parties</h2>
        <p>
          We use Google Firebase (Authentication, Cloud Firestore) as a data processor.
          Data is not shared or sold for advertising purposes.
        </p>

        <h2>Data Security</h2>
        <p>Data is encrypted in transit and at rest. Access is restricted by role.</p>

        <h2>Retention</h2>
        <p>
          Your data is retained while your account is active. <strong>When you delete your account</strong>{' '}
          your conversations, messages, memories, and user record are permanently deleted.
        </p>

        <h2>User Controls</h2>
        <ul>
          <li>
            <strong>Clear Chat History and Memories:</strong> You can permanently delete all conversations,
            messages, and memories using the <em>Clear History</em> option without deleting your account.
          </li>
          <li>
            <strong>Delete Account:</strong> You can delete all your data via Profile &gt; Edit Profile &gt; Permanently Delete Account.
          </li>
        </ul>

        <h2>Your Rights</h2>
        <p>
          You can exercise your rights to access, rectify, delete, object, and complain via{' '}
          <a href="mailto:eminaksu@esydelabs.com">eminaksu@esydelabs.com</a>.
        </p>

        <h2>Children's Privacy</h2>
        <p>The App is not intended for children under 13.</p>

        <h2>Changes</h2>
        <p>This policy may be updated from time to time. The current version is published on this page.</p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:eminaksu@esydelabs.com">eminaksu@esydelabs.com</a>
        </p>
      </div>
    </div>
  </div>
);

const Privacy = () => {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? <EnglishPrivacy /> : <TurkishPrivacy />;
};

export default Privacy;
