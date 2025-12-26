import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calculator, Users, Clock, Gift, Building2, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '@/components/AuroraBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Format number with Persian separators
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fa-IR').format(Math.round(num));
};

// Parse formatted number back to number
const parseNumber = (str: string): number => {
  const cleaned = str.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

// Input component with Rial formatting
const RialInput = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "۰" 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  label: string;
  placeholder?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(value ? formatNumber(value) : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numValue = parseNumber(rawValue);
    setDisplayValue(numValue ? formatNumber(numValue) : '');
    onChange(numValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="text-left bg-secondary/50 border-border pl-16"
          dir="ltr"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ریال
        </span>
      </div>
    </div>
  );
};

const NumberInput = ({ 
  value, 
  onChange, 
  label,
  suffix = ""
}: { 
  value: number; 
  onChange: (val: number) => void; 
  label: string;
  suffix?: string;
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="text-left bg-secondary/50 border-border pl-16"
          dir="ltr"
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default function CostCalculator() {
  const navigate = useNavigate();
  
  // Section 1: Contract
  const [isNetContract, setIsNetContract] = useState(false);
  const [baseSalary, setBaseSalary] = useState(0);
  const [jobAbsorption, setJobAbsorption] = useState(0);
  const [responsibilityAllowance, setResponsibilityAllowance] = useState(0);
  const [jobSuperlative, setJobSuperlative] = useState(0);
  const [housingAllowance, setHousingAllowance] = useState(11000000); // Fixed
  const [groceryAllowance, setGroceryAllowance] = useState(8500000); // Fixed
  const [childrenAllowance, setChildrenAllowance] = useState(0);
  const [otherBenefits, setOtherBenefits] = useState(0);

  // Section 2: Variable Pay
  const [overtimeBaseHours, setOvertimeBaseHours] = useState(176);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [monthlyPerformance, setMonthlyPerformance] = useState(0);
  const [monthlyBonus, setMonthlyBonus] = useState(0);

  // Section 3: Annual & Welfare
  const [supplementaryInsurance, setSupplementaryInsurance] = useState(0);
  const [annualOccasionalBenefits, setAnnualOccasionalBenefits] = useState(0);

  // Section 4: Hidden HR Costs
  const [recruitmentCost, setRecruitmentCost] = useState(0);
  const [trainingCost, setTrainingCost] = useState(0);
  const [miscCost, setMiscCost] = useState(0);

  // Calculations
  const calculations = useMemo(() => {
    // Gross-up calculation if Net contract
    let effectiveBase = baseSalary;
    let effectiveAbsorption = jobAbsorption;
    let effectiveResponsibility = responsibilityAllowance;
    let effectiveSuperlative = jobSuperlative;

    if (isNetContract) {
      // Reverse calculate: Net = Gross - 7% Insurance - Tax
      // Simplified: Gross ≈ Net / 0.93 (approximate for 7% employee insurance)
      const grossUpFactor = 1 / 0.93;
      effectiveBase = baseSalary * grossUpFactor;
      effectiveAbsorption = jobAbsorption * grossUpFactor;
      effectiveResponsibility = responsibilityAllowance * grossUpFactor;
      effectiveSuperlative = jobSuperlative * grossUpFactor;
    }

    // Gross salary components subject to insurance
    const insurableGross = effectiveBase + effectiveAbsorption + effectiveResponsibility + effectiveSuperlative;
    
    // Total gross salary
    const totalGross = insurableGross + housingAllowance + groceryAllowance + childrenAllowance + otherBenefits;

    // Overtime calculation
    const hourlyRate = overtimeBaseHours > 0 ? insurableGross / overtimeBaseHours : 0;
    const overtimePay = hourlyRate * 1.4 * overtimeHours;

    // Variable pay total
    const variablePay = overtimePay + monthlyPerformance + monthlyBonus;

    // Annual benefits amortized monthly
    const monthlyOccasionalBenefits = annualOccasionalBenefits / 12;

    // Statutory costs (Employer)
    const employerInsurance = insurableGross * 0.23; // 23% employer share
    const severanceAccrual = effectiveBase / 12; // 1 month per year
    const eidiAccrual = (effectiveBase * 2) / 12; // 2 months per year
    const leaveRedemption = (effectiveBase / 30) * 2.5; // 2.5 days per month

    // Total statutory costs
    const totalStatutory = employerInsurance + severanceAccrual + eidiAccrual + leaveRedemption;

    // Welfare costs
    const totalWelfare = supplementaryInsurance + monthlyOccasionalBenefits;

    // Hidden HR costs
    const totalHiddenHR = recruitmentCost + trainingCost + miscCost;

    // Total monthly cost
    const totalMonthlyCost = totalGross + variablePay + totalStatutory + totalWelfare + totalHiddenHR;

    // Net salary (for comparison)
    const employeeInsurance = insurableGross * 0.07;
    const netSalary = totalGross - employeeInsurance;

    // Multiplier
    const multiplier = netSalary > 0 ? totalMonthlyCost / netSalary : 0;

    return {
      effectiveBase,
      insurableGross,
      totalGross,
      overtimePay,
      variablePay,
      monthlyOccasionalBenefits,
      employerInsurance,
      severanceAccrual,
      eidiAccrual,
      leaveRedemption,
      totalStatutory,
      totalWelfare,
      totalHiddenHR,
      totalMonthlyCost,
      netSalary,
      multiplier
    };
  }, [
    isNetContract, baseSalary, jobAbsorption, responsibilityAllowance, jobSuperlative,
    housingAllowance, groceryAllowance, childrenAllowance, otherBenefits,
    overtimeBaseHours, overtimeHours, monthlyPerformance, monthlyBonus,
    supplementaryInsurance, annualOccasionalBenefits,
    recruitmentCost, trainingCost, miscCost
  ]);

  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              محاسبه بهای تمام شده نیروی انسانی
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              محاسبه دقیق هزینه واقعی ماهانه کارمند بر اساس استانداردهای ایرانی
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Contract */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    بخش ۱: قرارداد (مبنای محاسبه)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contract Mode Switch */}
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium">نوع قرارداد</p>
                      <p className="text-sm text-muted-foreground">
                        {isNetContract ? 'قرارداد خالص - سیستم مبلغ ناخالص را محاسبه می‌کند' : 'قرارداد ناخالص'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={!isNetContract ? 'text-primary font-medium' : 'text-muted-foreground'}>ناخالص</span>
                      <Switch checked={isNetContract} onCheckedChange={setIsNetContract} />
                      <span className={isNetContract ? 'text-primary font-medium' : 'text-muted-foreground'}>خالص</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RialInput label="پایه حقوق" value={baseSalary} onChange={setBaseSalary} />
                    <RialInput label="حق جذب" value={jobAbsorption} onChange={setJobAbsorption} />
                    <RialInput label="حق مسئولیت" value={responsibilityAllowance} onChange={setResponsibilityAllowance} />
                    <RialInput label="فوق‌العاده شغل" value={jobSuperlative} onChange={setJobSuperlative} />
                    <RialInput label="حق مسکن (ثابت)" value={housingAllowance} onChange={setHousingAllowance} />
                    <RialInput label="بن خواروبار (ثابت)" value={groceryAllowance} onChange={setGroceryAllowance} />
                    <RialInput label="حق اولاد" value={childrenAllowance} onChange={setChildrenAllowance} />
                    <RialInput label="سایر مزایا" value={otherBenefits} onChange={setOtherBenefits} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 2: Variable Pay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    بخش ۲: پرداخت‌های متغیر و اضافه‌کار
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberInput label="ساعات مبنای اضافه‌کار" value={overtimeBaseHours} onChange={setOvertimeBaseHours} suffix="ساعت" />
                    <NumberInput label="ساعات اضافه‌کار" value={overtimeHours} onChange={setOvertimeHours} suffix="ساعت" />
                    <RialInput label="کارانه ماهانه" value={monthlyPerformance} onChange={setMonthlyPerformance} />
                    <RialInput label="پاداش ماهانه" value={monthlyBonus} onChange={setMonthlyBonus} />
                  </div>
                  
                  {overtimeHours > 0 && (
                    <div className="p-3 bg-accent/10 rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        محاسبه اضافه‌کار: (پایه + جذب + مسئولیت + فوق‌العاده) ÷ {overtimeBaseHours} × ۱.۴ × {overtimeHours} = 
                        <span className="font-bold text-foreground mr-2">{formatNumber(calculations.overtimePay)} ریال</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 3: Annual & Welfare */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-green-500" />
                    </div>
                    بخش ۳: مزایای سالانه و رفاهی
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RialInput label="بیمه تکمیلی (سهم کارفرما - ماهانه)" value={supplementaryInsurance} onChange={setSupplementaryInsurance} />
                    <RialInput label="مزایای موردی سالانه (مصوب هیئت‌مدیره)" value={annualOccasionalBenefits} onChange={setAnnualOccasionalBenefits} />
                  </div>
                  
                  {annualOccasionalBenefits > 0 && (
                    <div className="p-3 bg-green-500/10 rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        سهم ماهانه مزایای موردی: {formatNumber(annualOccasionalBenefits)} ÷ ۱۲ = 
                        <span className="font-bold text-foreground mr-2">{formatNumber(calculations.monthlyOccasionalBenefits)} ریال</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 4: Hidden HR Costs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-border bg-gradient-to-br from-destructive/5 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-destructive" />
                    </div>
                    بخش ۴: هزینه‌های پنهان منابع انسانی
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full">ویژه</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    این هزینه‌ها معمولاً در محاسبات حقوق نادیده گرفته می‌شوند اما بخش مهمی از هزینه واقعی نیرو هستند.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <RialInput label="هزینه جذب و جایگزینی (ماهانه)" value={recruitmentCost} onChange={setRecruitmentCost} />
                    <RialInput label="هزینه آموزش و آنبوردینگ (ماهانه)" value={trainingCost} onChange={setTrainingCost} />
                    <RialInput label="هزینه‌های متفرقه و مصرفی" value={miscCost} onChange={setMiscCost} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="sticky top-6"
            >
              {/* Main Result */}
              <Card className="glass-card border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent mb-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">هزینه واقعی ماهانه شرکت</p>
                    <p className="text-4xl md:text-5xl font-bold text-destructive mb-2">
                      {formatNumber(calculations.totalMonthlyCost)}
                    </p>
                    <p className="text-lg text-muted-foreground">ریال</p>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <p className="text-lg">
                        <span className="font-bold text-primary">{calculations.multiplier.toFixed(2)}x</span>
                        <span className="text-muted-foreground mr-2">برابر حقوق خالص</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <Card className="glass-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="w-5 h-5 text-primary" />
                    جزئیات محاسبات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Gross Salary */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">حقوق ناخالص ماهانه</p>
                    <p className="text-xl font-bold">{formatNumber(calculations.totalGross)} ریال</p>
                  </div>

                  <Separator />

                  {/* Variable Pay */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">پرداخت‌های متغیر</p>
                    <p className="text-xl font-bold">{formatNumber(calculations.variablePay)} ریال</p>
                  </div>

                  <Separator />

                  {/* Statutory Costs */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">هزینه‌های قانونی کارفرما</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>بیمه کارفرما (۲۳٪)</span>
                        <span className="font-medium">{formatNumber(calculations.employerInsurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ذخیره سنوات (پایه÷۱۲)</span>
                        <span className="font-medium">{formatNumber(calculations.severanceAccrual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ذخیره عیدی (پایه×۲÷۱۲)</span>
                        <span className="font-medium">{formatNumber(calculations.eidiAccrual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ذخیره مرخصی (پایه÷۳۰×۲.۵)</span>
                        <span className="font-medium">{formatNumber(calculations.leaveRedemption)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-border">
                        <span>جمع هزینه‌های قانونی</span>
                        <span className="text-primary">{formatNumber(calculations.totalStatutory)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Welfare */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">هزینه‌های رفاهی</p>
                    <p className="text-xl font-bold">{formatNumber(calculations.totalWelfare)} ریال</p>
                  </div>

                  <Separator />

                  {/* Hidden HR */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">هزینه‌های پنهان HR</p>
                    <p className="text-xl font-bold text-destructive">{formatNumber(calculations.totalHiddenHR)} ریال</p>
                  </div>

                  <Separator />

                  {/* Comparison */}
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">حقوق خالص کارمند</span>
                      <span className="font-bold text-green-500">{formatNumber(calculations.netSalary)} ریال</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">هزینه واقعی شرکت</span>
                      <span className="font-bold text-destructive">{formatNumber(calculations.totalMonthlyCost)} ریال</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
