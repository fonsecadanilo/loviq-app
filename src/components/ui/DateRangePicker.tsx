import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DateRangePickerProps {
    onRangeChange?: (range: { from: Date | null; to: Date | null }) => void;
    placeholder?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    onRangeChange,
    placeholder = 'Select date range'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<{ from: Date | null; to: Date | null }>({
        from: null,
        to: null
    });
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Date utilities
    const getMonthStart = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const getMonthEnd = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    const addMonths = (date: Date, months: number) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isSameMonth = (date1: Date, date2: Date) => {
        return date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isBefore = (date1: Date, date2: Date) => {
        return date1.getTime() < date2.getTime();
    };

    const isAfter = (date1: Date, date2: Date) => {
        return date1.getTime() > date2.getTime();
    };

    const isWithinRange = (date: Date, start: Date, end: Date) => {
        return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
    };

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatMonthYear = (date: Date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleDateClick = (date: Date) => {
        if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
            setSelectedRange({ from: date, to: null });
        } else {
            if (isBefore(date, selectedRange.from)) {
                setSelectedRange({ from: date, to: selectedRange.from });
            } else {
                setSelectedRange({ from: selectedRange.from, to: date });
            }
        }
    };

    const handleClear = () => {
        setSelectedRange({ from: null, to: null });
        onRangeChange?.({ from: null, to: null });
    };

    const handleApply = () => {
        if (selectedRange.from && selectedRange.to) {
            onRangeChange?.(selectedRange);
            setIsOpen(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const monthStart = getMonthStart(date);
        const monthEnd = getMonthEnd(date);
        const startDay = monthStart.getDay();
        const daysInMonth = monthEnd.getDate();

        const days: Date[] = [];

        // Add padding days from previous month
        const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);
        const prevMonthDays = prevMonthEnd.getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            days.push(new Date(date.getFullYear(), date.getMonth() - 1, prevMonthDays - i));
        }

        // Add current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(date.getFullYear(), date.getMonth(), i));
        }

        // Add padding days from next month
        const remainingDays = 42 - days.length; // 6 weeks * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(date.getFullYear(), date.getMonth() + 1, i));
        }

        return days;
    };

    const isDateInRange = (date: Date) => {
        if (!selectedRange.from) return false;

        const rangeEnd = selectedRange.to || hoverDate;
        if (!rangeEnd) return false;

        const actualStart = isBefore(selectedRange.from, rangeEnd) ? selectedRange.from : rangeEnd;
        const actualEnd = isAfter(selectedRange.from, rangeEnd) ? selectedRange.from : rangeEnd;

        return isWithinRange(date, actualStart, actualEnd);
    };

    const isDateSelected = (date: Date) => {
        return (selectedRange.from && isSameDay(date, selectedRange.from)) ||
            (selectedRange.to && isSameDay(date, selectedRange.to));
    };

    const formatDisplayValue = () => {
        if (selectedRange.from && selectedRange.to) {
            return `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`;
        }
        return placeholder;
    };

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 items-center gap-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors min-w-[280px]"
            >
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <div className="flex-1 text-left text-sm text-gray-600">
                    {formatDisplayValue()}
                </div>
                {selectedRange.from && selectedRange.to && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-[340px]">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {formatMonthYear(currentMonth)}
                        </h3>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            disabled={isSameMonth(currentMonth, new Date())}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-xs font-medium text-gray-500 text-center py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {getDaysInMonth(currentMonth).map((date, index) => {
                            const isCurrentMonth = isSameMonth(date, currentMonth);
                            const isInRange = isDateInRange(date);
                            const isSelected = isDateSelected(date);
                            const isToday = isSameDay(date, new Date());
                            const isFutureDate = isAfter(date, new Date());
                            const isDisabled = !isCurrentMonth || isFutureDate;

                            return (
                                <button
                                    key={index}
                                    onClick={() => !isDisabled && handleDateClick(date)}
                                    onMouseEnter={() => !isDisabled && setHoverDate(date)}
                                    onMouseLeave={() => setHoverDate(null)}
                                    disabled={isDisabled}
                                    className={`
                                        relative h-10 text-sm rounded-lg transition-all
                                        ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}
                                        ${isInRange && !isSelected && !isDisabled ? 'bg-purple-50' : ''}
                                        ${isSelected && !isDisabled ? 'bg-[#7D2AE8] text-white font-medium' : ''}
                                        ${!isSelected && !isInRange && !isDisabled ? 'hover:bg-gray-100' : ''}
                                        ${isToday && !isSelected && !isDisabled ? 'border border-[#7D2AE8]' : ''}
                                    `}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                handleClear();
                                setIsOpen(false);
                            }}
                            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!selectedRange.from || !selectedRange.to}
                            className="px-3 py-1.5 text-sm bg-[#7D2AE8] text-white rounded-lg hover:bg-[#6d24ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
