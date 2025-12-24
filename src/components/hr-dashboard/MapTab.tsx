import { useState } from 'react';
import { Employee } from '@/types/employee';
import { ChartCard } from './ChartCard';
import { PrintButton } from './PrintButton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

interface MapTabProps {
  data: Employee[];
}

// Position and click areas for each region (percentage-based grid layout)
const regionPositions: Record<number, { row: number; col: number }> = {
  1: { row: 0, col: 4 }, 2: { row: 0, col: 3 }, 3: { row: 0, col: 2 }, 4: { row: 1, col: 4 }, 5: { row: 0, col: 1 },
  6: { row: 1, col: 2 }, 7: { row: 1, col: 3 }, 8: { row: 2, col: 4 }, 9: { row: 2, col: 1 }, 10: { row: 2, col: 2 },
  11: { row: 2, col: 3 }, 12: { row: 3, col: 3 }, 13: { row: 3, col: 4 }, 14: { row: 4, col: 4 }, 15: { row: 4, col: 3 },
  16: { row: 3, col: 2 }, 17: { row: 3, col: 1 }, 18: { row: 2, col: 0 }, 19: { row: 4, col: 1 }, 20: { row: 4, col: 2 },
  21: { row: 1, col: 0 }, 22: { row: 0, col: 0 },
};

const COLORS = ['#1e3a5f', '#234b6e', '#2a5c7d', '#316d8c', '#387e9b', '#3f8faa', '#46a0b9', '#4db1c8'];

export function MapTab({ data }: MapTabProps) {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  // Count employees per region
  const regionCounts: Record<number, number> = {};
  data.forEach(e => {
    regionCounts[e.region] = (regionCounts[e.region] || 0) + 1;
  });

  // Filter employees by selected region
  const filteredEmployees = selectedRegion
    ? data.filter(e => e.region === selectedRegion)
    : data;

  const formatNumber = (num: number) => new Intl.NumberFormat('fa-IR').format(num);

  const getColorIntensity = (count: number) => {
    const maxCount = Math.max(...Object.values(regionCounts), 1);
    const index = Math.floor((count / maxCount) * (COLORS.length - 1));
    return COLORS[index];
  };

  return (
    <div className="space-y-4 print-area">
      {/* Print Button */}
      <div className="flex justify-end">
        <PrintButton title="گزارش نقشه مناطق" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir="rtl">
        {/* Employee List */}
        <ChartCard title={selectedRegion ? `لیست پرسنل منطقه ${formatNumber(selectedRegion)}` : "لیست تمام پرسنل"}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>تعداد: {formatNumber(filteredEmployees.length)} نفر</span>
            </div>
            {selectedRegion && (
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-sm text-primary hover:text-primary/80"
              >
                نمایش همه
              </button>
            )}
          </div>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-right text-foreground">منطقه</TableHead>
                  <TableHead className="text-right text-foreground">نام و نام خانوادگی</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.sort((a, b) => a.region - b.region).map((employee) => (
                  <TableRow key={employee.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-foreground">{formatNumber(employee.region)}</TableCell>
                    <TableCell className="text-foreground">{employee.fullName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </ChartCard>

        {/* Map Grid */}
        <ChartCard title="نقشه پراکندگی پرسنل در مناطق تهران">
          <div className="relative w-full rounded-lg overflow-hidden p-4">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }, (_, row) => (
                Array.from({ length: 5 }, (_, col) => {
                  const region = Object.entries(regionPositions).find(
                    ([_, pos]) => pos.row === row && pos.col === col
                  );
                  
                  if (!region) {
                    return <div key={`${row}-${col}`} className="aspect-square" />;
                  }

                  const regionNum = parseInt(region[0]);
                  const count = regionCounts[regionNum] || 0;
                  const isSelected = selectedRegion === regionNum;

                  return (
                    <button
                      key={regionNum}
                      onClick={() => setSelectedRegion(isSelected ? null : regionNum)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 border-2 ${
                        isSelected
                          ? 'bg-primary border-primary scale-105 shadow-lg shadow-primary/30 z-10'
                          : 'hover:scale-105 hover:shadow-md border-border/50'
                      }`}
                      style={{
                        backgroundColor: isSelected ? undefined : getColorIntensity(count),
                      }}
                      title={`منطقه ${formatNumber(regionNum)} - ${formatNumber(count)} نفر`}
                    >
                      <span className="font-bold text-white text-sm">
                        {formatNumber(regionNum)}
                      </span>
                      <span className="text-white/80 text-xs">
                        ({formatNumber(count)})
                      </span>
                    </button>
                  );
                })
              )).flat()}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center bg-muted/50 px-3 py-2 rounded-lg">
              <span className="text-muted-foreground text-sm">برای مشاهده لیست پرسنل روی هر منطقه کلیک کنید</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
