// DOM Elementlerini Seçme
const musicList = document.getElementById('music-list');
const fileInput = document.getElementById('file-input');
const selectMusicBtn = document.getElementById('select-music-btn');
const trackName = document.querySelector('.track-name');
const trackArtist = document.querySelector('.track-artist');
const trackArt = document.querySelector('.track-art');
const playPauseBtn = document.querySelector('.playpause-track');
const prevBtn = document.querySelector('.prev-track');
const nextBtn = document.querySelector('.next-track');
const seekSlider = document.querySelector('.seek-slider');
const volumeSlider = document.querySelector('.volume-slider');
const currentTimeElement = document.querySelector('.current-time');
const totalDurationElement = document.querySelector('.total-duration');

// Global Değişkenler
let track_list = [];
let track_index = 0;
let isPlaying = false;
let updateTimer;
let isAndroid = /Android/i.test(navigator.userAgent);

// Audio Elementi Oluşturma
const curr_track = new Audio();

// Event Listeners
window.addEventListener('load', setupPlayer);
selectMusicBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// Oynatıcıyı Kur
function setupPlayer() {
    // Ses seviyesini ayarla
    curr_track.volume = volumeSlider.value / 100;
    
    // Local Storage'dan müzik listesini al (varsa)
    const savedMusic = localStorage.getItem('musicList');
    if (savedMusic) {
        try {
            const musicData = JSON.parse(savedMusic);
            for (const music of musicData) {
                if (music && music.name && music.artist) {
                    addMusicToListFromStorage(music.name, music.artist);
                }
            }
            
            // Eğer cihaz Android ise ve müzik listesi boşsa uyarı göster
            if (isAndroid && track_list.length === 0) {
                showAndroidStorageWarning();
            }
        } catch (error) {
            console.error("Müzik listesi yüklenirken hata:", error);
        }
    } else if (isAndroid) {
        showAndroidStorageWarning();
    }
    
    // PWA yükleme önerisi - A2HS için
    if (isAndroid) {
        setupInstallPrompt();
    }
}

// Android için özel uyarı göster
function showAndroidStorageWarning() {
    alert("Android cihazınızdaki müzik dosyalarına erişmek için 'Müzik Seç' butonuna tıklayın ve müziklerinizi seçin. Android güvenlik sistemi, Web uygulamalarının doğrudan dosya sistemine erişimini kısıtlamaktadır.");
}

// PWA yükleme önerisi
let deferredPrompt;
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Chrome 76+ öncesi yükleme isteğini engelleme
        e.preventDefault();
        // İsteği saklama
        deferredPrompt = e;
        
        // Kullanıcıya uygulama yükleme seçeneği göster
        setTimeout(() => {
            if (confirm("IMP3 Oynatıcıyı telefonunuza uygulama olarak yüklemek ister misiniz?")) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Kullanıcı yüklemeyi kabul etti');
                    }
                    deferredPrompt = null;
                });
            }
        }, 3000); // 3 saniye sonra göster
    });
}

// Local Storage'dan müzik ekleme
function addMusicToListFromStorage(title, artist) {
    // Track listesine ekle (dosya URL'si olmadan)
    track_list.push({
        name: title,
        artist: artist,
        source: null, // Local storage'da URL saklanamadığı için null
        image: 'https://source.unsplash.com/Qrspubmx6kE/640x360'
    });
    
    // Listeye ekle
    const li = document.createElement('li');
    li.textContent = `${title} - ${artist}`;
    li.dataset.index = track_list.length - 1;
    li.classList.add('storage-item'); // Depodan gelen öğeleri işaretle
    
    li.addEventListener('click', function() {
        if (!track_list[this.dataset.index].source) {
            alert('Bu şarkı dosyasını tekrar seçmeniz gerekmektedir. "Müzik Seç" butonuna tıklayarak müzik dosyanızı seçin.');
            fileInput.click();
        } else {
            const index = parseInt(this.dataset.index);
            loadTrack(index);
            playpauseTrack();
        }
    });
    
    musicList.appendChild(li);
}

// Dosya Seçimini İşle
function handleFileSelect(e) {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Sadece ses dosyalarını kabul et
        if (!file.type.startsWith('audio/')) continue;
        
        // Dosya adından sanatçı ve şarkı adını çıkarmaya çalış
        let fileName = file.name.replace(/\.[^/.]+$/, ""); // Uzantıyı kaldır
        let artist = "Bilinmeyen Sanatçı";
        let title = fileName;
        
        // Dosya adını parçalamayı dene (tipik format: "Sanatçı - Şarkı Adı")
        if (fileName.includes(' - ')) {
            const parts = fileName.split(' - ');
            artist = parts[0].trim();
            title = parts[1].trim();
        }
        
        // File API kullanarak dosyaya URL oluştur
        const fileUrl = URL.createObjectURL(file);
        
        // Eşleşen bir şarkı var mı diye kontrol et
        let matchFound = false;
        for (let j = 0; j < track_list.length; j++) {
            const track = track_list[j];
            if (track.name === title && track.artist === artist && !track.source) {
                // Mevcut parçayı güncelle
                track.source = fileUrl;
                document.querySelector(`#music-list li[data-index="${j}"]`).classList.remove('storage-item');
                matchFound = true;
                break;
            }
        }
        
        // Eşleşme yoksa yeni müzik olarak ekle
        if (!matchFound) {
            addMusicToList(title, artist, fileUrl);
        }
    }
    
    // İlk şarkıyı yükle (eğer daha önce hiç şarkı yoksa veya hiç kaynağı olmayan şarkı varsa)
    let firstTrackWithSource = track_list.findIndex(track => track.source !== null);
    if (firstTrackWithSource !== -1) {
        loadTrack(firstTrackWithSource);
    }
    
    // Local Storage'a kaydet
    saveToLocalStorage();
}

// Müziği Listeye Ekle
function addMusicToList(title, artist, source) {
    // Track listesine ekle
    track_list.push({
        name: title,
        artist: artist,
        source: source,
        image: 'https://source.unsplash.com/Qrspubmx6kE/640x360'
    });
    
    // Listeye ekle
    const li = document.createElement('li');
    li.textContent = `${title} - ${artist}`;
    li.dataset.index = track_list.length - 1;
    
    li.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        loadTrack(index);
        playpauseTrack();
    });
    
    musicList.appendChild(li);
}

// Local Storage'a Kaydet
function saveToLocalStorage() {
    const musicData = track_list.map(track => ({
        name: track.name,
        artist: track.artist,
        source: null // URL'leri saklamıyoruz, çünkü bunlar oturum tabanlı
    }));
    
    try {
        localStorage.setItem('musicList', JSON.stringify(musicData));
    } catch (error) {
        console.error("Müzik listesi kaydedilirken hata:", error);
    }
}

// Parçayı Yükle
function loadTrack(index) {
    clearInterval(updateTimer);
    resetValues();
    
    // Geçerli şarkı indeksini güncelle
    track_index = index;
    
    if (!track_list[track_index].source) {
        alert('Bu şarkı dosyasını tekrar seçmeniz gerekmektedir. "Müzik Seç" butonuna tıklayarak müzik dosyanızı seçin.');
        return;
    }
    
    // Yeni parçayı yükle
    curr_track.src = track_list[track_index].source;
    curr_track.load();
    
    // Şarkı bilgilerini güncelle
    trackName.textContent = track_list[track_index].name;
    trackArtist.textContent = track_list[track_index].artist;
    trackArt.style.backgroundImage = `url(${track_list[track_index].image})`;
    
    // Aktif şarkıyı listede vurgula
    document.querySelectorAll('#music-list li').forEach((item, idx) => {
        if (idx === track_index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Zamanlayıcıyı başlat
    updateTimer = setInterval(seekUpdate, 1000);
    
    // Şarkı bittiğinde sonraki şarkıya geç
    curr_track.addEventListener('ended', nextTrack);
}

// Değerleri Sıfırla
function resetValues() {
    currentTimeElement.textContent = "00:00";
    totalDurationElement.textContent = "00:00";
    seekSlider.value = 0;
}

// Oynat/Duraklat
function playpauseTrack() {
    if (!track_list.length || !track_list[track_index].source) return;
    
    if (!isPlaying) playTrack();
    else pauseTrack();
}

// Oynat
function playTrack() {
    curr_track.play()
        .then(() => {
            isPlaying = true;
            // Simgeyi değiştir
            playPauseBtn.innerHTML = '<i class="fas fa-pause-circle fa-3x"></i>';
        })
        .catch(error => {
            console.error("Müzik çalınırken hata:", error);
            alert("Müzik çalınırken bir hata oluştu. Lütfen dosyayı tekrar seçin.");
        });
}

// Duraklat
function pauseTrack() {
    curr_track.pause();
    isPlaying = false;
    
    // Simgeyi değiştir
    playPauseBtn.innerHTML = '<i class="fas fa-play-circle fa-3x"></i>';
}

// Önceki Parça
function prevTrack() {
    if (!track_list.length) return;
    
    // Kaynak dosyası olan önceki parçayı bul
    let prevIndex = track_index - 1;
    while (prevIndex >= 0) {
        if (track_list[prevIndex].source) {
            loadTrack(prevIndex);
            playTrack();
            return;
        }
        prevIndex--;
    }
    
    // Baştan bulamazsak, sondan itibaren kaynağı olan ilk parçayı bul
    prevIndex = track_list.length - 1;
    while (prevIndex > track_index) {
        if (track_list[prevIndex].source) {
            loadTrack(prevIndex);
            playTrack();
            return;
        }
        prevIndex--;
    }
    
    // Hiç kaynak bulunamazsa uyarı göster
    alert("Çalınabilecek başka müzik yok. Lütfen 'Müzik Seç' butonuyla müzik ekleyin.");
}

// Sonraki Parça
function nextTrack() {
    if (!track_list.length) return;
    
    // Kaynak dosyası olan sonraki parçayı bul
    let nextIndex = track_index + 1;
    while (nextIndex < track_list.length) {
        if (track_list[nextIndex].source) {
            loadTrack(nextIndex);
            playTrack();
            return;
        }
        nextIndex++;
    }
    
    // Sondan bulamazsak, baştan itibaren kaynağı olan ilk parçayı bul
    nextIndex = 0;
    while (nextIndex < track_index) {
        if (track_list[nextIndex].source) {
            loadTrack(nextIndex);
            playTrack();
            return;
        }
        nextIndex++;
    }
    
    // Hiç kaynak bulunamazsa uyarı göster
    alert("Çalınabilecek başka müzik yok. Lütfen 'Müzik Seç' butonuyla müzik ekleyin.");
}

// Belirli Bir Konuma Git
function seekTo() {
    if (!curr_track.duration) return;
    const seekPosition = curr_track.duration * (seekSlider.value / 100);
    curr_track.currentTime = seekPosition;
}

// Ses Seviyesini Ayarla
function setVolume() {
    curr_track.volume = volumeSlider.value / 100;
}

// Zaman ve Kaydırıcıyı Güncelle
function seekUpdate() {
    let seekPosition = 0;
    
    // İşlev zaman hesaplamalarını kontrol eder
    if (!isNaN(curr_track.duration)) {
        seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seekSlider.value = seekPosition;
        
        // Geçerli süre ve toplam süreyi hesapla
        let currentMinutes = Math.floor(curr_track.currentTime / 60);
        let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(curr_track.duration / 60);
        let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);
        
        // Sıfır ekleyerek düzelt
        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }
        
        // Süre güncelleme
        currentTimeElement.textContent = currentMinutes + ":" + currentSeconds;
        totalDurationElement.textContent = durationMinutes + ":" + durationSeconds;
    }
}

// Mobil cihazlar için dosya erişimi bildirimi
document.addEventListener('DOMContentLoaded', function() {
    if (isAndroid) {
        setTimeout(() => {
            alert('IMP3 Oynatıcı uygulamasının cihazınızdaki müzik dosyalarına erişmesi için "Müzik Seç" butonuna tıklayarak dosyalarınızı seçmeniz gerekmektedir. Android güvenlik sistemi, uygulamaların doğrudan dosya sistemine erişimine izin vermez.');
        }, 1000);
    }
});