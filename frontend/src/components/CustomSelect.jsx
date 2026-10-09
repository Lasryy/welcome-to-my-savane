import { useEffect, useId, useRef, useState } from "react";
import "../styles/dropdown.css";

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
  const generatedId = useId();
  const menuId = `${generatedId}-options`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex(
    (option) => String(option.value ?? option.label) === String(value ?? ""),
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const displayedValue = selectedOption?.label || placeholder || "Choisir une option";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function closeOnOutsideClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isOpen]);

  function openMenu(index = selectedIndex) {
    if (disabled || options.length === 0) {
      return;
    }

    setActiveIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  }

  function chooseOption(option) {
    if (option.disabled) {
      return;
    }

    onChange(option.value ?? option.label);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event) {
    if (options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        openMenu(selectedIndex + direction);
        return;
      }

      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (activeIndex + direction + options.length) % options.length;
      setActiveIndex(nextIndex);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) {
        chooseOption(option);
      }
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  return (
    <span ref={rootRef} className={`custom-select-wrap ${className}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`custom-select-trigger ${triggerClassName}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-activedescendant={isOpen ? `${menuId}-option-${activeIndex}` : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={!selectedOption ? "custom-select-placeholder" : ""}>
          {displayedValue}
        </span>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="custom-select-arrow">
          <path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div id={menuId} className="custom-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => {
            const optionValue = option.value ?? option.label;
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;

            return (
              <button
                key={optionValue}
                id={`${menuId}-option-${index}`}
                type="button"
                className={`custom-select-option${isSelected ? " is-selected" : ""}${isActive ? " is-active" : ""}`}
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => chooseOption(option)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}
