/** Plain text stays plain text; paragraphs and bullet lines gain readable spacing. */
export default function TextContent({ text }) {
  const paragraphs = String(text || "")
    .trim()
    .split(/\n\s*\n/);
  return (
    <div className="text-content">
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split("\n");
        const firstLine = lines[0].trim();
        const hasHeading =
          lines.length > 1 &&
          firstLine.length < 85 &&
          !/[.!?;:]$/.test(firstLine) &&
          !firstLine.startsWith("-");
        const content = hasHeading ? lines.slice(1) : lines;
        return (
          <div key={index}>
            {hasHeading && <h3>{firstLine}</h3>}
            {content.map((line, lineIndex) =>
              line.startsWith("- ") ? (
                <p className="text-bullet" key={lineIndex}>
                  {line.slice(2)}
                </p>
              ) : (
                <p key={lineIndex}>{line}</p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}
