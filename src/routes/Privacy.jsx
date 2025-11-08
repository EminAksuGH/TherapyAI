import React from 'react';
import styles from './Privacy.module.css';

const Privacy = () => {
  return (
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
            Hesabınız açık kaldıkça verileriniz saklanır. <strong>Hesabınızı sildiğinizde</strong> {' '}
            konuşmalarınız, mesajlarınız, hatıralarınız ve kullanıcı kaydınız kalıcı olarak silinir.
          </p>

          <h2>Kullanıcı Kontrolleri</h2>
          <ul>
            <li>
              <strong>Sohbet Geçmişi ve Hatıraları Temizleme:</strong> Hesabınızı silmeden de uygulama içindeki  {' '}
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
};

export default Privacy;
