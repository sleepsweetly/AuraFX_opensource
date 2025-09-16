// Chain Animation Web Worker
// Bu worker chain mode animasyonunu ayrı thread'de çalıştırır

let animationId: any = null;
let isRunning = false;

interface ChainAnimationMessage {
    type: 'start' | 'stop' | 'update';
    chainItems?: any[];
    cycleDuration?: number;
}

self.onmessage = function (e: MessageEvent<ChainAnimationMessage>) {
    const { type, chainItems, cycleDuration = 3 } = e.data;

    switch (type) {
        case 'start':
            if (!isRunning && chainItems && chainItems.length > 0) {
                isRunning = true;
                startAnimation(chainItems, cycleDuration);
            }
            break;

        case 'stop':
            if (isRunning) {
                isRunning = false;
                if (animationId) {
                    clearInterval(animationId);
                    animationId = null;
                }
            }
            break;

        case 'update':
            // Chain items güncellendi, animasyonu durdurmadan güncelle
            if (isRunning) {
                // Animasyonu durdurmadan sadece chain items'ı güncelle
                // Worker içinde global bir değişken olarak chainItems'ı saklayabiliriz
                if (chainItems && chainItems.length > 0) {
                    // Mevcut animasyonu durdur ve yenisini başlat
                    if (animationId) {
                        clearInterval(animationId);
                    }
                    startAnimation(chainItems, cycleDuration);
                } else {
                    isRunning = false;
                    if (animationId) {
                        clearInterval(animationId);
                        animationId = null;
                    }
                }
            }
            break;
    }
};

function startAnimation(chainItems: any[], cycleDuration: number) {
    const totalElements = chainItems.reduce((count, item) => {
        if (item.type === 'element') {
            const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);
            return count + elementIds.length;
        }
        return count;
    }, 0);

    let startTime = Date.now();

    // 30 FPS için 33ms interval
    animationId = setInterval(() => {
        if (!isRunning) return;

        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) * 0.001; // Convert to seconds
        const animationData: any[] = [];

        let elementIndex = 0;
        chainItems.forEach((item) => {
            if (item.type === 'element') {
                const elementIds = item.elementIds || (item.elementId ? [item.elementId] : []);

                elementIds.forEach((elementId: string) => {
                    // Calculate pulse timing for this element
                    // İlk eklenen element ilk animasyon olacak (elementIndex 0'dan başlar)
                    const elementDelay = (elementIndex / Math.max(1, totalElements - 1)) * cycleDuration;
                    const animationPhase = (elapsedTime - elementDelay) % (cycleDuration * 2); // Çift cycle için
                    
                    let pulseIntensity = 0;
                    let isActive = false;
                    
                    if (animationPhase >= 0 && animationPhase <= cycleDuration) {
                        // Forward animation phase
                        const pulseProgress = animationPhase / cycleDuration;
                        pulseIntensity = Math.sin(pulseProgress * Math.PI * 2) * 0.5 + 0.5;
                        isActive = pulseProgress < 0.3;
                    }

                    animationData.push({
                        elementId,
                        pulseIntensity,
                        isActive,
                        time: elapsedTime,
                        order: elementIndex,
                        delay: elementDelay
                    });

                    elementIndex++;
                });
            }
        });

        // Ana thread'e animasyon verilerini gönder
        self.postMessage({
            type: 'animationFrame',
            data: animationData,
            timestamp: currentTime
        });

    }, 33); // ~30 FPS
}

export { };