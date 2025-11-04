// Shape Library - Merkezi şekil veritabanı
// Yeni şekil eklemek için sadece bu diziye yeni bir obje ekle!

export interface ShapeDefinition {
  id: string; // 'star', 'heart', 'arrow' gibi benzersiz bir kimlik
  name: string; // Arayüzde görünecek isim
  path: string; // Şeklin SVG path verisi
}

// Burası bizim şekil veritabanımız!
// Yeni şekil eklemek için tek yapman gereken bu diziye yeni bir obje eklemek.
export const shapeLibrary: ShapeDefinition[] = [
  {
    id: 'star',
    name: 'Star',
    // 5 köşeli bir yıldız path'i
    path: 'M 50,0 L 61.8,38.2 L 100,38.2 L 69.1,61.8 L 80.9,100 L 50,76.4 L 19.1,100 L 30.9,61.8 L 0,38.2 L 38.2,38.2 Z',
  },
  {
    id: 'heart',
    name: 'Heart',
    // Bir kalp path'i
    path: 'M 50,25 C 20,0, 0,20, 0,40 C 0,70, 50,100, 50,100 C 50,100, 100,70, 100,40 C 100,20, 80,0, 50,25 Z',
  },
  {
    id: 'arrow',
    name: 'Arrow',
    // Bir ok path'i
    path: 'M 0,40 L 60,40 L 60,20 L 100,50 L 60,80 L 60,60 L 0,60 Z',
  },
  {
    id: 'lightning',
    name: 'Lightning',
    // Şimşek path'i
    path: 'M 50,0 L 20,50 L 40,50 L 10,100 L 80,40 L 60,40 Z',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    // Elmas path'i
    path: 'M 50,0 L 100,50 L 50,100 L 0,50 Z',
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    // Altıgen path'i
    path: 'M 25,0 L 75,0 L 100,43.3 L 75,86.6 L 25,86.6 L 0,43.3 Z',
  },
  {
    id: 'pentagon',
    name: 'Pentagon',
    // Beşgen path'i
    path: 'M 50,0 L 95.1,34.5 L 76.9,90.5 L 23.1,90.5 L 4.9,34.5 Z',
  },
  {
    id: 'octagon',
    name: 'Octagon',
    // Sekizgen path'i
    path: 'M 29.3,0 L 70.7,0 L 100,29.3 L 100,70.7 L 70.7,100 L 29.3,100 L 0,70.7 L 0,29.3 Z',
  },
  {
    id: 'cross',
    name: 'Cross',
    // Haç path'i
    path: 'M 40,0 L 60,0 L 60,40 L 100,40 L 100,60 L 60,60 L 60,100 L 40,100 L 40,60 L 0,60 L 0,40 L 40,40 Z',
  },
  {
    id: 'moon',
    name: 'Moon',
    // Hilal path'i
    path: 'M 50,0 C 77.6,0 100,22.4 100,50 C 100,77.6 77.6,100 50,100 C 35,100 22,88 15,72 C 25,85 40,90 55,85 C 70,80 80,65 80,50 C 80,35 70,20 55,15 C 40,10 25,15 15,28 C 22,12 35,0 50,0 Z',
  },
  {
    id: 'flower',
    name: 'Flower',
    // Çiçek path'i (6 yapraklı)
    path: 'M 50,10 C 60,20 60,30 50,40 C 60,30 70,30 80,40 C 70,50 70,60 80,70 C 70,60 60,60 50,70 C 60,60 60,50 50,40 C 40,50 40,60 30,70 C 40,60 40,50 30,40 C 40,30 50,30 50,10 Z',
  },

  {
    id: 'butterfly',
    name: 'Butterfly',
    // Kelebek path'i
    path: 'M 50,20 C 40,10 30,15 25,25 C 20,35 25,45 35,50 C 25,55 20,65 25,75 C 30,85 40,90 50,80 C 60,90 70,85 75,75 C 80,65 75,55 65,50 C 75,45 80,35 75,25 C 70,15 60,10 50,20 Z',
  }
];

// Helper function: Kütüphaneden şekil bul
export const findShapeById = (id: string): ShapeDefinition | undefined => {
  return shapeLibrary.find(shape => shape.id === id);
};

// Helper function: Tüm şekil ID'lerini al
export const getAllShapeIds = (): string[] => {
  return shapeLibrary.map(shape => shape.id);
};