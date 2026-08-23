"use client";

import { getCopy, type Locale } from "@/i18n";
import {
  backgroundsIn,
  type BackgroundId,
} from "@/lib/backgrounds";

type FondPickerProps = {
  value: BackgroundId;
  onChange: (id: BackgroundId) => void;
  locale?: Locale;
};

export function FondPicker({ value, onChange, locale = "fr" }: FondPickerProps) {
  const copy = getCopy(locale);
  const currentName = copy.fondNames[value] ?? value;

  return (
    <div className="fond-picker">
      <p className="fond-legend">
        <span className="fond-chip fond-chip-mini" data-palette={value} />
        <span>
          {copy.fondLabel} · {currentName}
        </span>
      </p>
      <p className="fond-hint">{copy.fondHint}</p>
      <div className="fond-groups">
        <FondGroup
          title={copy.fondClassical}
          group="classique"
          value={value}
          onChange={onChange}
          locale={locale}
        />
        <FondGroup
          title={copy.fondOriginal}
          group="original"
          value={value}
          onChange={onChange}
          locale={locale}
        />
      </div>
    </div>
  );
}

function FondGroup({
  title,
  group,
  value,
  onChange,
  locale,
}: {
  title: string;
  group: "classique" | "original";
  value: BackgroundId;
  onChange: (id: BackgroundId) => void;
  locale: Locale;
}) {
  const copy = getCopy(locale);
  return (
    <div className="fond-group">
      <p className="fond-group-title">{title}</p>
      <div className="fond-swatches">
        {backgroundsIn(group).map((item) => {
          const selected = item.id === value;
          const name = copy.fondNames[item.id] ?? item.label;
          return (
            <button
              key={item.id}
              type="button"
              className="fond-swatch"
              data-selected={selected ? "true" : "false"}
              aria-pressed={selected}
              aria-label={`${copy.fondLabel} ${name}`}
              onClick={() => onChange(item.id)}
            >
              <span className="fond-chip" data-palette={item.id} />
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
