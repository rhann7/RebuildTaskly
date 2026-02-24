import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Activity } from 'lucide-react';

// Daftarkan elemen ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ChartProps {
    data?: number[];   // Array jam kerja, cth: [5, 7.5, 8, 4, 6, 0, 0]
    target?: number; // Target jam kerja per hari (Default: 8 jam)
}

export const ProductivityChart = ({ data, target = 8 }: ChartProps) => {
    // Data default jika backend belum mengirim data (Dummy)
    const chartData = data || [0, 0, 0, 0, 0, 0, 0];
    const targetData = Array(7).fill(target); // Bikin array [8,8,8,8,8,8,8]

    const dataConfig = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Hours Logged',
                data: chartData,
                backgroundColor: '#ef4444', // Warna SADA Red
                hoverBackgroundColor: '#dc2626',
                borderRadius: 6, // Bikin ujung bar membulat
                borderSkipped: false,
                barThickness: 16, // Ketebalan bar Logged
            },
            {
                label: 'Daily Target',
                data: targetData,
                backgroundColor: 'rgba(161, 161, 170, 0.15)', // Warna abu-abu transparan (zinc-400)
                hoverBackgroundColor: 'rgba(161, 161, 170, 0.25)',
                borderRadius: 6,
                borderSkipped: false,
                barThickness: 16, // Ketebalan bar Target
            }
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Sembunyikan legend default karena kita bikin custom HTML di bawah
            },
            tooltip: {
                backgroundColor: 'rgba(9, 9, 11, 0.95)', // Warna gelap modern (zinc-950)
                titleFont: { size: 13, weight: 'bold', family: "'Inter', sans-serif" },
                bodyFont: { size: 12, family: "'Inter', sans-serif" },
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                    label: function(context) {
                        return ` ${context.dataset.label}: ${context.parsed.y} Hours`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 10, // Kasih jarak atas sedikit dari target 8 jam
                border: { display: false },
                grid: {
                    color: 'rgba(150, 150, 150, 0.1)', // Garis grid horizontal tipis
                },
                ticks: {
                    color: 'rgba(150, 150, 150, 0.8)',
                    font: { size: 10, weight: 'bold', family: "'Inter', sans-serif" },
                    stepSize: 2,
                }
            },
            x: {
                border: { display: false },
                grid: {
                    display: false, // Hilangkan garis vertikal biar bersih
                },
                ticks: {
                    color: 'rgba(150, 150, 150, 0.8)',
                    font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
                }
            }
        },
    };

    return (
        <div className="bg-card rounded-[32px] p-8 border border-border/60 shadow-sm flex flex-col w-full h-full min-h-[400px]">
            {/* --- HEADER CHART --- */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase  flex items-center gap-2">
                        <Activity size={20} className="text-sada-red" /> Weekly Productivity
                    </h2>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                        Total operational hours across the week
                    </p>
                    
                    {/* CUSTOM HTML LEGEND (Lebih rapi dari bawaan ChartJS) */}
                    <div className="flex items-center gap-5 mt-5">
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-sm bg-[#ef4444] shadow-sm" />
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Logged</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-sm bg-muted-foreground/20 border border-border" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target (8H)</span>
                        </div>
                    </div>
                </div>
                
                {/* --- TOTAL HOURS BOX --- */}
                <div className="text-right bg-muted/20 px-4 py-3 rounded-2xl border border-border/50">
                    <span className="text-3xl font-black  text-foreground leading-none">
                        {chartData.reduce((a, b) => a + b, 0).toFixed(1)}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mt-1">
                        Total Hours
                    </span>
                </div>
            </div>

            {/* --- CONTAINER CHART (FLEX-1 agar mengisi sisa ruang) --- */}
            <div className="relative w-full flex-1">
                <Bar data={dataConfig} options={options} />
            </div>
        </div>
    );
};