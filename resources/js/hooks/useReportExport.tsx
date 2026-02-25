import { useState } from 'react';

type UseReportExportOptions = {
    endpoint: string;
    defaultFilename?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
};

export function useReportExport({
    endpoint,
    defaultFilename = 'report.xlsx',
    onSuccess,
    onError,
}: UseReportExportOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const exportReport = async (filters: Record<string, any>) => {
        setIsLoading(true);
        setExportSuccess(false);

        try {
            const queryParams = new URLSearchParams(
                Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
            ).toString();

            const response = await fetch(`${endpoint}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });

            if (!response.ok) throw new Error('Export failed');

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = defaultFilename;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/i);
                if (match) filename = match[1];
            }

            const blob = await response.blob();
            const url  = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href     = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 5000);
            onSuccess?.();
        } catch (error) {
            console.error('Export error:', error);
            onError?.(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { exportReport, isLoading, exportSuccess };
}
