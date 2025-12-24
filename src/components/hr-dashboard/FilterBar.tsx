import { FilterState } from '@/types/employee';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string[]) => void;
  options: {
    genders: string[];
    educations: string[];
    departments: string[];
    locations: string[];
    positions: string[];
  };
}

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs md:text-sm text-muted-foreground font-semibold">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="bg-muted border-border h-8 md:h-10 text-xs md:text-sm justify-between px-3 w-full"
          >
            <span className="truncate">
              {selected.length === 0
                ? 'همه'
                : selected.length === 1
                  ? selected[0]
                  : `${selected.length} انتخاب شده`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 bg-popover border-border z-50" align="start">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
            <span className="text-xs text-muted-foreground">{selected.length} انتخاب شده</span>
            {selected.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-xs"
              >
                پاک کردن
              </Button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                onClick={() => handleToggle(option)}
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selected.slice(0, 2).map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="text-xs px-2 py-0.5 gap-1"
            >
              {item}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(item);
                }}
              />
            </Badge>
          ))}
          {selected.length > 2 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{selected.length - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filters, onFilterChange, options }: FilterBarProps) {
  return (
    <div className="glass-card rounded-lg p-3 md:p-4 mb-4 md:mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
        <MultiSelectFilter
          label="جنسیت"
          options={options.genders}
          selected={filters.gender}
          onChange={(value) => onFilterChange('gender', value)}
        />

        <MultiSelectFilter
          label="تحصیلات"
          options={options.educations}
          selected={filters.education}
          onChange={(value) => onFilterChange('education', value)}
        />

        <MultiSelectFilter
          label="معاونت"
          options={options.departments}
          selected={filters.department}
          onChange={(value) => onFilterChange('department', value)}
        />

        <MultiSelectFilter
          label="محل فعالیت"
          options={options.locations}
          selected={filters.location}
          onChange={(value) => onFilterChange('location', value)}
        />

        <div className="col-span-2 sm:col-span-1">
          <MultiSelectFilter
            label="جایگاه سازمانی"
            options={options.positions}
            selected={filters.position}
            onChange={(value) => onFilterChange('position', value)}
          />
        </div>
      </div>
    </div>
  );
}
