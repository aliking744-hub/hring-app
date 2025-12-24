import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface PrintButtonProps {
  title?: string;
}

export function PrintButton({ title = 'گزارش داشبورد منابع انسانی' }: PrintButtonProps) {
  const handlePrint = () => {
    const printStyle = document.createElement('style');
    printStyle.id = 'print-styles';
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
        body * {
          visibility: hidden;
        }
        .print-area, .print-area * {
          visibility: visible;
        }
        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          direction: rtl;
        }
        .print-header {
          display: flex !important;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 10px 20px;
          border-bottom: 2px solid #1e3a5f;
          margin-bottom: 15px;
          width: 100%;
        }
        .print-header img {
          height: 40px;
          width: 40px;
          object-fit: contain;
        }
        .print-header h1 {
          font-size: 18px;
          color: #1e3a5f;
          margin: 0;
        }
        .no-print {
          display: none !important;
        }
        .recharts-wrapper {
          width: 100% !important;
          max-width: 100% !important;
        }
        .recharts-surface {
          width: 100% !important;
        }
        .grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 15px !important;
        }
        .grid > div {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .lg\\:grid-cols-2 {
          grid-template-columns: 1fr 1fr !important;
        }
        .space-y-6 > * + * {
          margin-top: 15px !important;
        }
        .glass-card, [class*="card"] {
          background: white !important;
          border: 1px solid #ddd !important;
          box-shadow: none !important;
          padding: 10px !important;
        }
        h3, h4, p, span, text {
          color: #333 !important;
          fill: #333 !important;
        }
        .recharts-cartesian-axis-tick-value {
          fill: #333 !important;
        }
        svg text {
          fill: #333 !important;
        }
      }
    `;
    document.head.appendChild(printStyle);

    window.print();

    setTimeout(() => {
      const style = document.getElementById('print-styles');
      if (style) style.remove();
    }, 1000);
  };

  return (
    <>
      {/* Print Header - hidden until print */}
      <div className="print-header hidden">
        <h1>{title}</h1>
        <img src={logo} alt="hring logo" />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2 no-print"
      >
        <Printer className="w-4 h-4" />
        پرینت
      </Button>
    </>
  );
}
