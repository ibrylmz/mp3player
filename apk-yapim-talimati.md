# MP3 Oynatıcı APK Oluşturma Talimatları

Bu döküman, web tabanlı MP3 Oynatıcı uygulamasının Android APK'sına dönüştürülme adımlarını açıklamaktadır.

## Gereksinimler

- Android Studio
- JDK 11 veya üzeri
- Bubblewrap CLI veya PWA Builder

## APK Oluşturma Adımları

### 1. Yöntem: PWA Builder ile APK Oluşturma

1. [PWA Builder](https://www.pwabuilder.com/) web sitesini ziyaret edin.
2. Uygulamanın URL'sini girin (web sunucusuna yüklenmiş olmalıdır).
3. "Build My PWA" butonuna tıklayın.
4. Android seçeneğini seçin ve "Options" kısmından gereken bilgileri doldurun:
   - Package ID: `com.myapp.mp3player`
   - Uygulama adı: MP3 Oynatıcı
   - Versiyon kodu: 1
   - Versiyon adı: 1.0.0
   - İkon: İkon dosyalarının bulunduğu klasörü seçin
5. "Build" butonuna tıklayın ve APK indirilecektir.

### 2. Yöntem: Bubblewrap CLI ile APK Oluşturma

1. Bubblewrap CLI'ı yükleyin:
   ```
   npm i -g @bubblewrap/cli
   ```

2. Projenizi hazırlayın:
   ```
   bubblewrap init --manifest https://sizinsite.com/manifest.json
   ```

3. Ayarları yapılandırın:
   ```
   cd twa-name
   ```

4. APK'yı derleyin:
   ```
   bubblewrap build
   ```

### 3. Yöntem: Android Studio TWA Projesi Oluşturma

1. Android Studio'yu açın.
2. Yeni bir proje oluşturun ve "Trusted Web Activity" şablonunu seçin.
3. Uygulama adı ve paket adı (örn: `com.myapp.mp3player`) girin.
4. "Launch URL" alanına web uygulamanızın URL'sini girin (https ile başlamalı).
5. Manifest dosyasını gösterin (uygulamanız web'de yayınlanmışsa).
6. İkon ayarlarını yapın ve "Finish" tıklayarak projeyi oluşturun.
7. `Build > Generate Signed Bundle/APK` menüsünden APK oluşturun.

## Notlar

- Bu uygulama, telefonun dosya sistemine erişmek için TWA çerezleri üzerinden izin ister.
- APK'nın imzalanması ve Google Play Store'da yayınlanması için geliştirici hesabına ihtiyaç vardır.
- Oluşturulan APK'yı kullanmak için, Android cihazınızda "Bilinmeyen Kaynaklar"dan uygulama kurulumuna izin vermeniz gerekebilir.

## Önemli Notlar

- PWA'lar belirli kısıtlamalar nedeniyle doğrudan telefon dosya sistemine erişim sağlayamaz. 
- Kullanıcı dosya seçici aracılığıyla müzik dosyalarını uygulamaya yüklemelidir.
- Gerçek bir telefon uygulaması gibi dosya sistemi erişimi sağlamak için, tamamen native bir uygulama geliştirmek gerekir (React Native, Flutter, Kotlin/Java vb. ile).

## Ek Bilgiler

Eğer tam dosya sistemi erişimi olan native bir MP3 oynatıcı geliştirmek istiyorsanız, aşağıdaki teknolojilerden birini kullanmanız önerilir:

1. React Native veya Flutter - Cross-platform geliştirme için
2. Java/Kotlin - Sadece Android için native geliştirme
3. Swift - Sadece iOS için native geliştirme 