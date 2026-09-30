// --- SES DOSYALARI ---
let normalSes = new Audio('normal_ses.mp3'); // İlk attığın standart işleme sesi
normalSes.loop = true;
normalSes.volume = 1.0; // Sesi fulledik (%100)

let tehlikeSesi = new Audio('tehlike_sesi.mp3'); // İkinci attığın köşeye yaklaşma sesi
tehlikeSesi.loop = true;
tehlikeSesi.volume = 1.0; // Sesi fulledik (%100)

let boomSesi = new Audio('boom.mp3'); // Patlama/Vurma sesi

// --- OYUN DEĞİŞKENLERİ ---
let cekicKonumu = 50; 
let oyunBittiMi = false;
let oyunDongusu; 
let cekicYonu = -1; 
let cekicHizi = 0.4;
let isSoruBekleniyor = false; // Buton spamlanmasını engellemek için kilit mekanizması

// --- YENİ EKLENEN SABİT SORU LİSTESİ (BURAYA EKLENMELİ) ---
const soruListesi = [
    { soru: "3x + 7 = 34", cevap: "x = 9" },
    { soru: "5x - 12 = 28", cevap: "x = 8" },
    { soru: "4(x + 3) = 36", cevap: "x = 6" },
    { soru: "7x + 5 = 3x + 29", cevap: "x = 6" },
    { soru: "2(x - 4) + 6 = 20", cevap: "x = 9" },
    { soru: "8x - 15 = 41", cevap: "x = 7" },
    { soru: "6(x + 2) = 48", cevap: "x = 6" },
    { soru: "9x - 17 = 55", cevap: "x = 8" },
    { soru: "5(x - 1) = 30", cevap: "x = 7" },
    { soru: "4x + 18 = 2x + 34", cevap: "x = 8" },
    { soru: "3(x + 5) - 4 = 20", cevap: "x = 3" },
    { soru: "7x - 8 = 5x + 16", cevap: "x = 12" },
    { soru: "2(3x - 1) = 22", cevap: "x = 4" },
    { soru: "5x + 9 = 3x + 25", cevap: "x = 8" },
    { soru: "8(x - 2) = 40", cevap: "x = 7" },
    { soru: "4x + 7 = 31", cevap: "x = 6" },
    { soru: "6x - 14 = 22", cevap: "x = 6" },
    { soru: "3(x + 4) + 5 = 29", cevap: "x = 4" },
    { soru: "10x - 7 = 63", cevap: "x = 7" },
    { soru: "5(x - 3) + 10 = 35", cevap: "x = 8" },
    { soru: "4(2x + 1) = 36", cevap: "x = 4" },
    { soru: "7(x - 1) = 42", cevap: "x = 7" },
    { soru: "9 + 3x = 33", cevap: "x = 8" },
    { soru: "5x - 11 = 2x + 13", cevap: "x = 8" },
    { soru: "2(x + 7) - 4 = 26", cevap: "x = 8" },
    { soru: "3(2x - 5) = 27", cevap: "x = 7" },
    { soru: "8x + 12 = 68", cevap: "x = 7" },
    { soru: "5(x + 2) = 45", cevap: "x = 7" },
    { soru: "6x - 9 = 45", cevap: "x = 9" },
    { soru: "4(x - 3) + 8 = 32", cevap: "x = 9" }
];

let aktifSoruIndex = 0; // Hangi soruda olduğumuzu takip etmek için

// EKRAN GEÇİŞİNİ SAĞLAYAN FONKSİYON (GÜNCELLENDİ)
function testGecis() {
    // 1. Önce isim girme ekranını görünür yap (gizli kalmasını önler)
    document.getElementById('selection-screen').style.display = 'flex';
    
    // 2. Flamanın yukarı kalkma animasyonunu tetikle
    document.getElementById('hub-screen').classList.add('kaldir');
}

function oyunuBaslat() {
    let oyuncu1 = document.getElementById('p1-name').value;
    let oyuncu2 = document.getElementById('p2-name').value;
    
    document.getElementById('player1-display').innerText = oyuncu1;
    document.getElementById('player2-display').innerText = oyuncu2;
    
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    
    yeniSoruUret();
    zamanlayiciyiBaslat(); // Oyunu ve çekicin hareketini başlat
}

// SÜREKLİ HAREKET EDEN ÇEKİÇ DÖNGÜSÜ
function zamanlayiciyiBaslat() {
    cekicYonu = Math.random() < 0.5 ? -1 : 1; 

    // --- OYUN BAŞI SESİ ---
    normalSes.currentTime = 0;
    normalSes.play();
    tehlikeSesi.pause(); // Garanti olsun diye tehlike sesini durduruyoruz

    oyunDongusu = setInterval(() => {
        if(oyunBittiMi) return;

        cekicKonumu += (cekicYonu * cekicHizi);

        // --- İKİ AŞAMALI SES KONTROLÜ ---
        // Eğer çekiç %25'ten küçük veya %75'ten büyük bir konuma geldiyse (Köşelere yaklaştıysa)
        if (cekicKonumu <= 25 || cekicKonumu >= 75) {
            if (tehlikeSesi.paused) { // Eğer tehlike sesi o an çalmıyorsa başlat
                normalSes.pause();
                tehlikeSesi.play(); 
            }
        } 
        // Eğer çekiç güvenli bölgedeyse (Ortalardaysa)
        else {
            if (normalSes.paused) { // Eğer normal ses o an çalmıyorsa başlat
                tehlikeSesi.pause();
                normalSes.play();
            }
        }

        let hammer = document.getElementById('hammer');
        hammer.style.left = cekicKonumu + '%';

        // Sınır Kontrolü (Çekiç %5'e veya %95'e ulaştıysa oyun biter)
        if (cekicKonumu <= 5) {
            oyunuBitir('sag'); 
        } 
        else if (cekicKonumu >= 95) {
            oyunuBitir('sol'); 
        }

    }, 100);
}

// MATEMATİK SORUSU ÜRETİCİ (GÜNCELLENDİ)
function yeniSoruUret() {
    if(oyunBittiMi) return;
    
    // Eğer tüm sorular bittiyse başa sarması için kontrol
    if (aktifSoruIndex >= soruListesi.length) {
        aktifSoruIndex = 0; 
    }
    
    // Sıradaki soruyu al ve ekrana yazdır
    let siradakiSoru = soruListesi[aktifSoruIndex].soru;
    document.getElementById('math-question').innerText = siradakiSoru;
    
    // İstersen cevabı konsolda görebilirsin (hakemlik yapan kişi için kolaylık sağlar)
    console.log("Mevcut Sorunun Cevabı: " + soruListesi[aktifSoruIndex].cevap);
    
    // Bir sonraki soru için indexi artır
    aktifSoruIndex++; 
}

// BUTONA BASILDIĞINDA ÇALIŞAN FONKSİYON (GÜNCELLENDİ)
function dogruBildi(kimBildi) {
    // Eğer oyun bittiyse veya yeni soru bekleniyorsa (kilitliyse) hiçbir şey yapma!
    if(oyunBittiMi || isSoruBekleniyor) return; 

    isSoruBekleniyor = true; // Diğer oyuncunun basmasını engellemek için butonları kilitle

    if(kimBildi === 'sol') {
        cekicYonu = 1; 
        cekicHizi += 0.2; 
    } 
    else if (kimBildi === 'sag') {
        cekicYonu = -1; 
        cekicHizi += 0.2; 
    }

    // Sorunun doğru cevabını ekranda gösterip vurgula
    let soruKutusu = document.getElementById('math-question');
    soruKutusu.innerText = soruListesi[aktifSoruIndex - 1].cevap; 
    soruKutusu.style.color = "#4ade80"; // Doğru bildiğini hissettiren fıstık yeşili
    soruKutusu.style.borderColor = "#4ade80";

    // 1.5 saniye boyunca cevabı ekranda tut, sonra yeni soruya geç
    setTimeout(() => {
        if(oyunBittiMi) return; // O 1.5 saniye içinde çekiç ulaşıp oyun bittiyse yeni soru sorma
        
        soruKutusu.style.color = "white"; // Rengi ve çerçeveyi eski haline getir
        soruKutusu.style.borderColor = "#ff9900";
        
        yeniSoruUret();
        isSoruBekleniyor = false; // Kilidi aç, butonlar tekrar basılabilir hale gelsin
    }, 1500);
}

//// OYUN BİTİŞ FONKSİYONU (GÜNCELLENDİ)
function oyunuBitir(kazanan) {
    oyunBittiMi = true;
    clearInterval(oyunDongusu);

    // --- SES KONTROLÜ ---
    normalSes.pause();   // Normal sesi sustur
    tehlikeSesi.pause(); // Tehlike sesini sustur
    boomSesi.play();     // Patlama/Vurma sesini çal

    let hammer = document.getElementById('hammer');

    // 1. Çekice Vurma Animasyonunu Ekle
    if (kazanan === 'sag') {
        // Çekiç sola ulaştıysa (Sağ kazandıysa), sola vur
        hammer.classList.add('vur-sol-animasyon'); 
    } else {
        // Çekiç sağa ulaştıysa (Sol kazandıysa), sağa vur
        hammer.classList.add('vur-sag-animasyon'); 
    }

    // 2. Animasyonun bitmesini bekle (CSS'te 0.8 saniye, biz tam bitmesi için 1 saniye bekliyoruz)
    setTimeout(() => {
        // 3. Oyun arayüzünü gizle
        document.getElementById('names-container').style.display = 'none';
        document.getElementById('equation-container').style.display = 'none';
        document.getElementById('track-container').style.display = 'none';
        document.getElementById('action-container').style.display = 'none';

        // 4. Kaybedeni belirle ve kağıdı göster
        let oyuncu1 = document.getElementById('player1-display').innerText;
        let oyuncu2 = document.getElementById('player2-display').innerText;
        let kaybeden = (kazanan === 'sag') ? oyuncu1 : oyuncu2;
        document.getElementById('loser-name').innerText = kaybeden;
        
        let endScreen = document.getElementById('end-screen');
        endScreen.style.display = 'flex';

        // 5. Rulo animasyonunu tetikle
        setTimeout(() => {
            let kagit = document.getElementById('a4-paper');
            kagit.classList.add('a4-rolled');
            
            // YENİ EKLENEN: 1.5 saniye rulo olmasını bekle, sonra aşağı düşür
            setTimeout(() => {
                kagit.classList.add('a4-drop-down'); 
                
                // Aşağı düşme süresi (0.8 saniye) bittiğinde videoyu başlat
                setTimeout(() => {
                    let endScreen = document.getElementById('end-screen');
                    endScreen.style.display = 'none'; // Kağıt ekranını gizle
                    
                    const videoContainer = document.getElementById('video-container');
                    const video = document.getElementById('end-video');
                    
                    videoContainer.style.display = 'flex';
                    video.play();
                    
                    // Video bittiğinde Hub ekranına dön
                    video.onended = () => {
                        videoContainer.style.display = 'none';
                        hubEkraninaDon();
                    };
                }, 800);
            }, 1500); 
        }, 2500); 
    }, 1000); // 1 saniyelik animasyon bekleme süresi
}

// OYUNU SIFIRLAYAN VE HUBA DÖNDÜREN FONKSİYON (GÜNCELLENDİ)
function hubEkraninaDon() {
    // 1. Ekranları sıfırla
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('selection-screen').style.display = 'none'; 
    document.getElementById('hub-screen').style.display = 'block';
    document.getElementById('math-question').style.color = "white";
    document.getElementById('math-question').style.borderColor = "#ff9900";
    isSoruBekleniyor = false; 
    
    // 2. Hub ekranını geri getir
    document.getElementById('hub-screen').classList.remove('kaldir');
    
    // KRİTİK ÇÖZÜM: Zorunlu stili siliyoruz ki bir sonraki tıklamada CSS (.kaldir) çalışabilsin!
    document.getElementById('hub-screen').style.transform = ''; 
    
    // 3. A4 kağıdı rulo ve düşme sınıflarını kaldır 
    document.getElementById('a4-paper').classList.remove('a4-rolled', 'a4-drop-down');
    
    // 4. Oyun değişkenlerini sıfırla
    cekicKonumu = 50;
    cekicHizi = 0.4;
    oyunBittiMi = false;
    aktifSoruIndex = 0; 
    
    // 5. Oyun ekranı elemanlarını geri görünür yap
    document.getElementById('names-container').style.display = 'flex';
    document.getElementById('equation-container').style.display = 'flex';
    document.getElementById('track-container').style.display = 'flex';
    document.getElementById('action-container').style.display = 'flex';
    
    document.getElementById('hammer').style.left = '50%';

    // 6. Çekiç animasyonlarını temizle ki yeni oyunda dik dursun
    document.getElementById('hammer').classList.remove('vur-sol-animasyon', 'vur-sag-animasyon');
}