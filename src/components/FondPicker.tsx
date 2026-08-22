"use client";

import {
  backgroundsIn,
  type BackgroundId,
} from "@/lib/backgrounds";

type FondPickerProps = {
  value: BackgroundId;
  onChange: (id: BackgroundId) => void;
};

export function FondPicker({ value, onChange }: FondPickerProps) {
  return (
    <div className="fond-picker">
      <p className="fond-picker-label">Fond</p>
      <div className="fond-groups">
        <FondGroup title="Classiques" group="classique" value={value} onChange={onChange} />
        <FondGroup title="Originaux" group="original" value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function FondGroup({
  title,
  group,
  value,
  onChange,
}: {
  title: string;
  group: "classique" | "original";
  value: BackgroundId;
  onChange: (id: BackgroundId) => void;
}) {
  return (
    <div className="fond-group">
      <p className="fond-group-title">{title}</p>
      <div className="fond-swatches" role="list">
        {backgroundsIn(group).map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className="fond-swatch"
              data-selected={selected ? "true" : "false"}
              aria-pressed={selected}
              aria-label={`Fond ${item.label}`}
              onClick={() => onChange(item.id)}
            >
              <span className="fond-chip" data-palette={item.id} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
