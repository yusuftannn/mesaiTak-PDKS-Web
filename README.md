# 📊 MesaiTak - Çalışan Devam/Devamsızlık ve Vardiya Yönetim Sistemi

MesaiTak, kuruluşların çalışan devam/devamsızlık izleme, vardiya yönetimi ve izin taleplerini verimli bir şekilde yönetmesine yardımcı olmak üzere tasarlanmış kapsamlı bir insan kaynakları yönetim platformudur. Gerçek zamanlı gözetleme, konum tabanlı izleme ve detaylı raporlama yetenekleri ile organizasyonlarının emek gücünü etkili bir şekilde yönetmesini sağlar.

---

## 🎯 Proje Hakkında

MesaiTak, modern web teknolojileri kullanılarak geliştirilen, tamamen özelliklere sahip bir HR yönetim uygulamasıdır. İşletmelerin çalışan verilerini merkezi bir platformda yönetmesine, raporlama yeteneklerini artırmasına ve operasyonel verimlilik sağlamasına olanak tanır.

### Ana Hedefler

✅ **Merkezi Devam/Devamsızlık Takibi**: Tüm çalışanların devam/devamsızlık verilerini tek bir platformda yönetin  
✅ **Gerçek Zamanlı İzleme**: Canlı panolar ile çalışan durumlarını anlık olarak takip edin  
✅ **GPS Tabanlı Konum Doğrulama**: Çalışanların kontrol saatlerini konum bilgisi ile doğrulayın  
✅ **Kapsamlı Raporlama**: Aylık, detaylı Puantaj raporları ve kitle dışa aktarımı  
✅ **Vardiya Yönetimi**: Esnek vardiya planlama ve yönetim sistemi  
✅ **İzin Yönetimi**: Yapılandırılabilir izin türleri ve talep yönetimi

---

## 🚀 Temel Özellikler

### 1. **Gerçek Zamanlı Gözetleme Paneli** 📈

Kuruluş yöneticileri için canlı kontrol paneli:

- **Gelen Çalışanlar**: İş saatden önce veya saatinde gelen personel sayısı ve detayları
- **Geç Gelenler**: Planlanan vardiya saatinden sonra gelen çalışanlar
- **Çalışan Durumda**: Aktif olarak çalışan personel
- **Mola İçinde**: Molada olan çalışanlar  
- **Devamsız**: İştiraksızlık gösterenlerin listesi
- **Erken Ayrılanlar**: Vardiya bitişinden önce ayrılan personel
- **Tatil Gösterimi**: Yaklaşan resmi tatiller ve özel günler

### 2. **Coğrafi Konum Tabanlı Devam/Devamsızlık Sistemi** 🗺️

- **Harita Entegrasyonu**: Leaflet tabanlı interaktif harita sistemi
- **GPS Doğrulaması**: Kontrol saatlerinin konum bilgisi ile doğrulanması
- **Çift Görünüm**: 
  - Liste görünümü: Tüm kayıtların tablosu
  - Harita görünümü: Çalışanların coğrafi dağılımı
- **Gerçek Zamanlı Veri**: Firebase Firestore dinleyicileri ile canlı veri akışı

### 3. **Vardiya Yönetim Sistemi** 📅

- **Vardiya Tanımlaması**: Çalışanlara vardiya ataması yapın
- **Vardiya Türleri**: Sabah, öğleden sonra, gece vardiyaları ve özel vardiyalar
- **Çoklu Şubeler**: Farklı şubeler için farklı vardiya kuralları
- **Vardiya Geçmişi**: Tüm vardiya değişikliklerinin tutulması

### 4. **İzin Yönetim Sistemi** 🏖️

- **İzin Türleri**: 
  - Yıllık izin
  - Hastalık izni
  - Mazeret izni  
  - Evlilik/Ölüm izni
  - Diğer özel izin türleri

- **İzin Talepleri**: Çalışanlar izin taleplerini sistem üzerinden talep eder
- **Onay Akışı**: Yöneticilerin talepleri onaylaması veya reddetmesi
- **İzin Bakiyesi**: Otomatik bakiye takibi ve raporu

### 5. **İleri Raporlama Sistemi** 📊

#### Puantaj Raporları
- **Günlük Detay**: Her çalışan için günlük devam/devamsızlık saati
- **Özet Bilgiler**: Aylık toplam çalışma saati, fazla mesai, müsait saatler
- **Girdi-Çıktı Saatleri**: Her günün giriş ve çıkış saatleri
- **Sapmalar**: Geç gelişler ve erken çıkışlar

#### Aylık Raporlar
- **Özet İstatistikler**: Departman bazında devam/devamsızlık oranları
- **Eğilim Analizi**: Aylık karşılaştırmalı analizler
- **Departman Raporları**: Bölüm bazında ayrıntılı veriler

#### Dışa Aktarma Türleri
- **PDF Raporları**: PDFMake kütüphanesi ile profesyonel PDF çıktı
- **Excel Sayfaları**: ExcelJS ile formatlanmış Excel dosyaları

### 6. **Çalışan Yönetimi** 👥

- **Profil Yönetimi**: Kişisel bilgi, iletişim bilgileri, çalışan numarası
- **Organizasyon Yapısı**: Şirkete, şubeye ve departmana atama
- **Rol Tanımlaması**: Basit rol yönetimi (Yönetici, Şef, Çalışan)
- **Toplu İşlemler**: Grup etiketleri ile toplu atamalar

### 7. **Grup Etiketleri ve Kategorilendirme** 🏷️

- **Dinamik Gruplandırma**: Çalışanları projelere, takımlara veya departmanlara göre grup olarak etiketleme
- **Hızlı Atama**: Grup etiketlerine göre toplu işlem yapabilme
- **İzin Yönetimi**: Gruplar için varsayılan vardiya ve izin kuralları atama

### 8. **Tatil ve Özel Günler Yönetimi** 🗓️

- **Resmi Tatiller**: Ülke çapında resmi tatillerin tanımlanması
- **Kamu Tatilleri**: Şehir/şube bazında farklı tatillerin uygulanması
- **Hafta Sonu Kuralları**: Dinamik hafta sonu tanımlaması
- **Otomatik Hesaplamalar**: Raporlarda tatillerin otomatik olarak dikkate alınması

### 9. **Güvenlik ve Erişim Kontrolü** 🔐

- **Firebase Authentication**: Kurumsal güvenlik standarlarına uygun kimlik doğrulama
- **Rol Tabanlı Erişim Kontrolü (RBAC)**: Kullanıcı rolüne göre özellik sınırlaması
- **Yönetici Yetkisi Doğrulaması**: Hassas işlemlerde `requireManager` kontrolü
- **Oturum Yönetimi**: Otomatik oturum başlatma ve yönetimi
- **Çevre Değişkenleri**: Hassas veriler `.env.local` dosyasında saklanması

---

## 🛠️ Teknoloji Yığını (Tech Stack)

### Frontend Teknolojileri

| Teknoloji | Versiyon | Kullanım Alanı |
|-----------|----------|----------------|
| **Next.js** | 16.1.6 | React framework, SSR/SSG, API rotaları |
| **React** | 19.2.3 | UI bileşenleri ve durum yönetimi |
| **TypeScript** | ^5 | Tür güvenliği ve geliştirici deneyimi |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **Zustand** | ^5 | Global durum yönetimi |
| **React Hook Form** | ^7.71 | Form durumu ve doğrulama |
| **Zod** | ^4.3 | Runtime şema doğrulaması |

### Harita ve Görselleştirme

| Kütüphane | Kullanım |
|-----------|----------|
| **Leaflet** | ^1.9.4 | Açık kaynak harita kütüphanesi |
| **React-Leaflet** | ^5.0.0 | Leaflet React bağdayı |

### Raporlama ve Dışa Aktarma

| Kütüphane | Kullanım |
|-----------|----------|
| **PDFMake** | ^0.3.4 | PDF rapor oluşturma |
| **ExcelJS** | ^4.4.0 | Excel sayfası oluşturma |

### Arka Uç ve Veritabanı

| Servis | Kullanım |
|--------|----------|
| **Firebase Authentication** | Kullanıcı kimlik doğrulaması |
| **Firestore** | NoSQL veritabanı ve gerçek zamanlı senkronizasyon |

### Diğer Kütüphaneler

| Kütüphane | Versiyon | Amaç |
|-----------|----------|------|
| **date-fns** | ^4.1.0 | Tarih ve zaman işlemleri |
| **Lucide React** | ^0.563 | Ikon kütüphanesi |
| **clsx** | ^2.1.1 | Koşullu CSS sınıf yönetimi |
| **uuid** | ^13.0.0 | Benzersiz kimlik oluşturma |

---

## 📋 Sistem Gereksinimleri

### Minimum Gereksinimler

- **Node.js**: 18.0.0 veya üzeri
- **npm**: 9.0.0 veya üzeri (veya Yarn, pnpm alternatifi)

---

## 🚀 Kurulum ve Başlatma

### 1. Projeyi Klonlama

```bash
# Git üzerinden indir
git clone https://github.com/yusuftannn/mesaitak-web.git

# Proje dizinine gir
cd mesaitak-web
```

### 2. Bağımlılıkların Kurulması

```bash
# npm ile
npm install

# veya yarn ile
yarn install

# veya pnpm ile  
pnpm install
```

### 3. Firebase Konfigürasyonu

`.env.local` dosyası oluşturun (proje kökünde):

```env
# Firebase Konfigürasyonu
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Not**: Firebase Console'den bu değerleri alabilirsiniz (Proje Ayarları → Genel).

### 4. Geliştirme Sunucusunu Başlatma

```bash
npm run dev
```

- Uygulama şu adreste erişilebilir: [http://localhost:3000](http://localhost:3000)
- Otomatik olarak login sayfasına yönlendirileceksiniz
- Hot reload etkin - dosya değişiklikleri anında uygulanır

### 5. Üretim İçin Derleme

```bash
# Yapı oluştur
npm run build

# Üretim sunucusunu başlat
npm start
```
---

## 📄 Lisans

Bu proje **MesaiTak Source Available License (MSAL) v1.0** kapsamında lisanslanmıştır.

Kaynak kodu; öğrenme, inceleme, değerlendirme ve katkı sağlama amacıyla herkese açıktır.

Yazılı izin alınmaksızın ticari kullanım, yeniden dağıtım, üretim ortamında kullanım, ticari amaçlı değiştirme veya bu projeden türetilmiş rakip ürünlerin geliştirilmesi **yasaktır**.

Ticari lisanslama veya kurumsal kullanım talepleri için lütfen iletişime geçin:

**E-posta:** yusuftan41@hotmail.com

**Copyright © 2026 Yusuf Tan. Tüm hakları saklıdır.**
