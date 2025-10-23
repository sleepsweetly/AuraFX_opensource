# Requirements Document

## Introduction

Bu özellik, mevcut 3D sahne için Blender benzeri bir axis widget (3D yön göstergesi) ekleyecektir. `Scene3DEditor.tsx` dosyasında zaten `BlenderAxisGizmo` komponenti mevcut ancak yorum satırında. Bu widget'ı aktif hale getirip geliştireceğiz. Widget, canvas'ın köşesinde sabit bir konumda durarak kullanıcıya mevcut kamera yönelimini gösterecek ve tıklandığında kamerayı seçilen eksene yönlendirecektir. Mevcut `SceneAxes` komponentinden farklı olarak, bu widget canvas'a göre sabit konumda duracak ve etkileşimli olacaktır. Bu, 3D navigasyonu büyük ölçüde kolaylaştıracak ve kullanıcı deneyimini iyileştirecektir.

## Requirements

### Requirement 1

**User Story:** 3D sahne kullanıcısı olarak, mevcut kamera yönelimini görsel olarak anlayabilmek için canvas köşesinde bir axis widget görmek istiyorum.

#### Acceptance Criteria

1. WHEN 3D sahne yüklendiğinde THEN sistem canvas'ın sağ üst köşesinde 3D axis widget'ını gösterecektir
2. WHEN kamera hareket ettirildiğinde THEN axis widget kamera yönelimine göre gerçek zamanlı olarak güncellenecektir
3. WHEN widget görüntülendiğinde THEN X (kırmızı), Y (yeşil), Z (mavi) eksenleri açık şekilde etiketlenmiş olacaktır
4. WHEN widget render edildiğinde THEN diğer 3D sahne elementlerinden bağımsız olarak her zaman görünür kalacaktır
5. WHEN widget görüntülendiğinde THEN mevcut `BlenderCameraControls` ile uyumlu çalışacaktır
6. WHEN widget aktif olduğunda THEN `Scene3DEditor` ve `OptimizedScene3D` komponentlerinde çalışacaktır
7. WHEN widget render edildiğinde THEN mevcut yorum satırındaki `BlenderAxisGizmo` komponenti temel alınacaktır

### Requirement 2

**User Story:** 3D sahne kullanıcısı olarak, hızlı navigasyon için axis widget'ının eksenlerine tıklayarak kamerayı o yöne çevirebilmek istiyorum.

#### Acceptance Criteria

1. WHEN kullanıcı X eksenine tıkladığında THEN kamera X ekseni boyunca pozitif yöne bakacak şekilde yumuşak geçişle hareket edecektir
2. WHEN kullanıcı Y eksenine tıkladığında THEN kamera Y ekseni boyunca pozitif yöne bakacak şekilde yumuşak geçişle hareket edecektir
3. WHEN kullanıcı Z eksenine tıkladığında THEN kamera Z ekseni boyunca pozitif yöne bakacak şekilde yumuşak geçişle hareket edecektir
4. WHEN eksen tıklandığında THEN kamera geçişi 500ms sürecek ve smooth easing kullanacaktır
5. WHEN kamera geçişi devam ederken THEN kullanıcı başka bir eksene tıklarsa mevcut animasyon iptal edilip yeni animasyon başlayacaktır
6. WHEN kamera hareket ettirildiğinde THEN mevcut `use3DStore.updateCamera` fonksiyonu kullanılacaktır
7. WHEN kamera animasyonu tamamlandığında THEN sahne merkezi (0,0,0) noktasına bakacaktır
8. WHEN widget tıklandığında THEN mevcut yorum satırındaki kod mantığı geliştirilecektir

### Requirement 3

**User Story:** 3D sahne kullanıcısı olarak, axis widget'ının görsel geri bildirim vermesini istiyorum böylece hangi eksene tıklayabileceğimi anlayabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı mouse'u bir eksen üzerine getirdiğinde THEN o eksen highlight edilecektir
2. WHEN kullanıcı mouse'u widget'tan çıkardığında THEN highlight kaldırılacaktır
3. WHEN bir eksen tıklandığında THEN tıklanan eksen kısa süreliğine farklı bir renkte yanıp sönecektir
4. WHEN widget etkileşimli durumda olduğunda THEN mouse cursor pointer'a dönüşecektir

### Requirement 4

**User Story:** 3D sahne kullanıcısı olarak, axis widget'ının performansımı etkilememesini istiyorum.

#### Acceptance Criteria

1. WHEN 3D sahne render edildiğinde THEN axis widget minimum performans etkisi yaratacaktır
2. WHEN widget güncellendiğinde THEN sadece kamera yönelimi değiştiğinde render edilecektir
3. WHEN widget etkileşimde olmadığında THEN gereksiz hesaplamalar yapılmayacaktır
4. WHEN sahne karmaşık olduğunda THEN widget'ın render performansı sabit kalacaktır

### Requirement 5

**User Story:** 3D sahne kullanıcısı olarak, axis widget'ının responsive olmasını ve farklı ekran boyutlarında düzgün çalışmasını istiyorum.

#### Acceptance Criteria

1. WHEN ekran boyutu değiştiğinde THEN widget boyutu ve konumu uygun şekilde ayarlanacaktır
2. WHEN mobil cihazda görüntülendiğinde THEN widget touch etkileşimlerini destekleyecektir
3. WHEN küçük ekranlarda THEN widget boyutu okunabilir kalacak şekilde ölçeklenecektir
4. WHEN widget konumlandırıldığında THEN diğer UI elementleriyle çakışmayacaktır

### Requirement 6

**User Story:** 3D sahne kullanıcısı olarak, axis widget'ının kamera yönelimine göre dinamik olarak güncellenmesini istiyorum.

#### Acceptance Criteria

1. WHEN kamera hareket ettirildiğinde THEN widget'ın eksen yönleri kamera açısına göre güncellenecektir
2. WHEN kamera döndürüldüğünde THEN widget'ın görsel temsili gerçek zamanlı olarak değişecektir
3. WHEN widget güncellendiğinde THEN performans etkisi minimal olacaktır
4. WHEN kamera animasyonu sırasında THEN widget yumuşak geçişlerle güncellenecektir