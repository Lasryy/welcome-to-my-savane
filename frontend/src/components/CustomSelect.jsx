/** Native selects keep keyboard, mobile, and form behavior consistent. */
export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  triggerClassName = "",
  ariaLabel,
}) {
  return (
    <select
      id={id}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`custom-select-trigger form-input ${className} ${triggerClassName}`}
    >
      {placeholder &&
        !options.some(
          (option) => String(option.value ?? option.label) === "",
        ) && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
      {options.map((option) => (
        <option
          key={option.value ?? option.label}
          value={option.value ?? option.label}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
