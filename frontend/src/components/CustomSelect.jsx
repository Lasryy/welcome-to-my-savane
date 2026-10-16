import { useEffect, useId, useRef, useState } from "react";

function toEnabledIndex(options, start, direction) {
  for (let index = start; index >= 0 && index < options.length; index += direction) {
    if (!options[index].disabled) return index;
  }
  return -1;
}

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
  const generatedId = useId().replaceAll(":", "");
  const triggerId = id || `select-${generatedId}`;
  const listboxId = `${triggerId}-options`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [invalid, setInvalid] = useState(false);

  const normalizedOptions = options.map((option) => ({
    value: String(option.value ?? option.label),
    label: String(option.label),
    disabled: Boolean(option.disabled),
  }));
  const hasEmptyOption = normalizedOptions.some((option) => option.value === "");
  const menuOptions = placeholder && !hasEmptyOption
    ? [{ value: "", label: placeholder, disabled: required }, ...normalizedOptions]
    : normalizedOptions;
  const selectedValue = String(value ?? "");
  const selectedOption = menuOptions.find((option) => option.value === selectedValue);
  const selectedIndex = menuOptions.findIndex((option) => option.value === selectedValue);
  const validationOptions = hasEmptyOption
    ? menuOptions
    : [{ value: "", label: "", disabled: required }, ...menuOptions];

  useEffect(() => {
    function closeOnOutsidePointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  useEffect(() => () => window.clearTimeout(typeaheadTimerRef.current), []);

  function openAt(index) {
    if (disabled) return;
    const fallback = toEnabledIndex(menuOptions, 0, 1);
    const nextIndex = index >= 0 && !menuOptions[index]?.disabled
      ? index
      : fallback;
    setActiveIndex(nextIndex);
    setOpen(true);
  }

  function selectOption(option) {
    if (option.disabled || disabled) return;
    onChange(option.value);
    setInvalid(false);
    setOpen(false);
  }

  function moveActive(direction) {
    const start = activeIndex < 0
      ? (direction > 0 ? 0 : menuOptions.length - 1)
      : activeIndex + direction;
    const nextIndex = toEnabledIndex(menuOptions, start, direction);
    if (nextIndex >= 0) setActiveIndex(nextIndex);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        const selected = selectedIndex >= 0 ? selectedIndex : event.key === "ArrowDown" ? 0 : menuOptions.length - 1;
        openAt(selected);
      } else {
        moveActive(event.key === "ArrowDown" ? 1 : -1);
      }
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const start = event.key === "Home" ? 0 : menuOptions.length - 1;
      const direction = event.key === "Home" ? 1 : -1;
      const nextIndex = toEnabledIndex(menuOptions, start, direction);
      setActiveIndex(nextIndex);
      setOpen(true);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        openAt(selectedIndex);
      } else if (menuOptions[activeIndex]) {
        selectOption(menuOptions[activeIndex]);
      }
      return;
    }

    if (event.key === "Tab" && open) {
      setOpen(false);
      return;
    }

    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      typeaheadRef.current += event.key.toLocaleLowerCase();
      window.clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = window.setTimeout(() => {
        typeaheadRef.current = "";
      }, 600);
      const start = selectedIndex >= 0 ? selectedIndex + 1 : 0;
      const nextIndex = [...menuOptions.slice(start), ...menuOptions.slice(0, start)]
        .findIndex((option) => !option.disabled && option.label.toLocaleLowerCase().startsWith(typeaheadRef.current));
      if (nextIndex >= 0) {
        const wrappedIndex = (start + nextIndex) % menuOptions.length;
        setActiveIndex(wrappedIndex);
        setOpen(true);
      }
    }
  }

  return (
    <div className={`custom-select ${className}`} ref={rootRef}>
      <button
        id={triggerId}
        ref={triggerRef}
        className={`custom-select-trigger form-input ${triggerClassName}`}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${listboxId}-error` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openAt(selectedIndex))}
        onKeyDown={handleKeyDown}
      >
        <span className={!selectedOption ? "custom-select-placeholder" : ""}>
          {selectedOption?.label || placeholder || "Choisir une option"}
        </span>
        <svg className={`custom-select-caret ${open ? "is-open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id={listboxId}
        className="custom-select-menu"
        role="listbox"
        aria-labelledby={triggerId}
        hidden={!open}
      >
        {menuOptions.map((option, index) => (
          <div
            id={`${listboxId}-option-${index}`}
            key={`${option.value}-${index}`}
            className={`custom-select-option ${index === activeIndex ? "is-active" : ""}`}
            role="option"
            aria-selected={option.value === selectedValue}
            aria-disabled={option.disabled || undefined}
            onMouseEnter={() => { if (!option.disabled) setActiveIndex(index); }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => selectOption(option)}
          >
            {option.label}
          </div>
        ))}
      </div>

      <select
        className="custom-select-validation"
        aria-hidden="true"
        tabIndex={-1}
        required={required && !disabled}
        disabled={disabled}
        value={selectedValue}
        onChange={() => {}}
        onInvalid={(event) => {
          event.preventDefault();
          setInvalid(true);
          triggerRef.current?.focus();
        }}
      >
        {validationOptions.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {invalid && <span className="custom-select-error" id={`${listboxId}-error`} role="alert">Choisis une option.</span>}
    </div>
  );
}
