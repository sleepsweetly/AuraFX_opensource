import { ANALYTICS_CONFIG, getDiscordWebhook } from '../config/analytics';

export interface CodeGenerationDetails {
  skillName: string;
  layerCount: number;
  elementCount: number;
  activeModes: string[];
  source: string;
}

interface UsageData {
  date: string;
  count: number;
  lastUsed: string;
}

interface AnalyticsData {
  totalUses: number;
  dailyUses: Record<string, number>;
  lastUsed: string;
}

class AnalyticsService {
  private readonly STORAGE_KEY = 'aurafx_analytics';
  
  private getData(): AnalyticsData {
    if (typeof window === 'undefined') {
      return { totalUses: 0, dailyUses: {}, lastUsed: '' };
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return { totalUses: 0, dailyUses: {}, lastUsed: '' };
    }
    
    try {
      const data = JSON.parse(stored);
      // Eski 'lastNotification' alanını temizle
      if (data.lastNotification) {
        delete data.lastNotification;
      }
      return data;
    } catch {
      return { totalUses: 0, dailyUses: {}, lastUsed: '' };
    }
  }
  
  private saveData(data: AnalyticsData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
  
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  public trackCodeGeneration(details: CodeGenerationDetails): void {
    console.log('📊 Analytics: Code generation tracking...');
    
    const data = this.getData();
    const today = this.getToday();
    
    console.log('📊 Analytics: Current data:', data)
    console.log('📊 Analytics: Today:', today)
    
    // Toplam kullanım sayısını artır
    data.totalUses += 1;
    
    // Maksimum kullanım sayısını kontrol et
    if (data.totalUses > ANALYTICS_CONFIG.STORAGE.MAX_TOTAL_USES) {
      data.totalUses = ANALYTICS_CONFIG.STORAGE.MAX_TOTAL_USES;
    }
    
    // Günlük kullanım sayısını artır
    data.dailyUses[today] = (data.dailyUses[today] || 0) + 1;
    
    // Son kullanım zamanını güncelle
    data.lastUsed = new Date().toISOString();
    
    console.log('📊 Analytics: Updated data:', data)
    
    // Eski günlük verileri temizle
    this.cleanOldData(data);
    
    // Veriyi kaydet
    this.saveData(data);
  }
  
  private cleanOldData(data: AnalyticsData): void {
    const retentionDays = ANALYTICS_CONFIG.STORAGE.DAILY_RETENTION_DAYS;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    Object.keys(data.dailyUses).forEach(date => {
      if (date < cutoffDateStr) {
        delete data.dailyUses[date];
      }
    });
  }
  
  public getStats(): { totalUses: number; todayUses: number; weeklyUses: number } {
    const data = this.getData();
    const today = this.getToday();
    
    // Bugünkü kullanım sayısı
    const todayUses = data.dailyUses[today] || 0;
    
    // Bu haftaki kullanım sayısı
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    let weeklyUses = 0;
    Object.entries(data.dailyUses).forEach(([date, count]) => {
      if (date >= weekAgoStr) {
        weeklyUses += count;
      }
    });
    
    return {
      totalUses: data.totalUses,
      todayUses,
      weeklyUses
    };
  }
  
  public getDailyStats(): { date: string; count: number }[] {
    const data = this.getData();
    return Object.entries(data.dailyUses)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, ANALYTICS_CONFIG.STORAGE.DAILY_RETENTION_DAYS);
  }
  
  // Verileri sıfırla (test için)
  public resetData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Kullanım takip fonksiyonu
export const trackCodeGeneration = (details: CodeGenerationDetails) => {
  analytics.trackCodeGeneration(details);
};

// İstatistik alma fonksiyonu
export const getAnalyticsStats = () => {
  return analytics.getStats();
};

// Günlük istatistik alma fonksiyonu
export const getDailyAnalytics = () => {
  return analytics.getDailyStats();
};

// Verileri sıfırlama fonksiyonu
export const resetAnalytics = () => {
  analytics.resetData();
}; 