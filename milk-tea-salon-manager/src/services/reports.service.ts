export type ReportPeriod = 'this-week' | 'this-month' | 'last-month' | 'custom';

export interface ServiceBreakdown {
    name: string;
    value: number;
    color: string;
}

export interface StaffRanking {
    id: string;
    name: string;
    revenue: number;
    avatar: string;
    color: string;
}

export interface DailyBreakdown {
    day: string;
    revenue: number;
    bookingCount: number;
}

export interface ReportData {
    period: ReportPeriod;
    dateRange: {
        start: string;
        end: string;
    };
    totalSales: number;
    newCustomers: number;
    avgTicket: number;
    serviceBreakdown: ServiceBreakdown[];
    staffRanking: StaffRanking[];
    dailyBreakdown: DailyBreakdown[];
}

const API_URL = '/api/admin/reports';

export const reportService = {
    async getReport(period: ReportPeriod, startDate?: string, endDate?: string): Promise<ReportData> {
        let url = `${API_URL}?period=${period}`;

        if (period === 'custom') {
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch report');
        return response.json();
    },
};
