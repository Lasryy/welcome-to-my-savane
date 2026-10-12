export default function HorizonSign({ tailwind = false }) {
  const signClass = tailwind
    ? "relative h-[240px] w-[250px] shrink-0 text-ink"
    : "horizon-sign";
  const sunClass = tailwind
    ? "absolute right-[17px] top-3 h-[102px] w-[102px] rounded-full bg-sun"
    : "horizon-sun";
  const fieldClass = tailwind
    ? "absolute bg-ink"
    : "horizon-field";
  const firstFieldClass = tailwind
    ? "absolute bottom-[94px] left-0 h-[85px] w-[200px] rounded-[130px_130px_0_0] bg-ink [transform:rotate(-7deg)]"
    : "horizon-field field-one";
  const secondFieldClass = tailwind
    ? "absolute bottom-[52px] right-0 h-[67px] w-[222px] rounded-[130px_130px_0_0] border border-ink bg-mint [transform:rotate(6deg)]"
    : "horizon-field field-two";
  const lineClass = tailwind
    ? "absolute bottom-[52px] h-px w-[230px] bg-ink"
    : "horizon-line";
  const captionClass = tailwind
    ? "absolute bottom-[13px] left-0 text-[26px] font-extrabold tracking-[-.04em]"
    : "horizon-foot";

  return (
    <div className={signClass} aria-hidden="true">
      <span className={sunClass} />
      <span className={tailwind ? firstFieldClass : `${fieldClass} field-one`} />
      <span className={tailwind ? secondFieldClass : `${fieldClass} field-two`} />
      <span className={lineClass} />
      <span className={captionClass}>le bon départ.</span>
      {tailwind && <span className="absolute left-[17px] top-[7px] h-[50px] w-[50px] rounded-full border border-ink" />}
    </div>
  );
}
