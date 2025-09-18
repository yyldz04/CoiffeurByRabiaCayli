interface SegmentPickerProps {
  options: string[];
  selectedOption: string;
  onOptionChange: (option: string) => void;
  className?: string;
}

export function SegmentPicker({ options, selectedOption, onOptionChange, className = "" }: SegmentPickerProps) {
  return (
    <div className={`flex border border-white/20 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onOptionChange(option)}
          className={`flex-1 px-6 py-3 tracking-[0.05em] uppercase transition-colors ${
            selectedOption === option
              ? 'bg-white text-black'
              : 'bg-transparent text-white hover:bg-white/10'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}