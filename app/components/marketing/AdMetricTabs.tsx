"use client";

import type { AdMetricKey } from "../../lib/marketing/types";

const TABS: { key: AdMetricKey; label: string }[] = [
  { key: "roas", label: "ROAS" },
  { key: "cpa", label: "CPA" },
  { key: "cpc", label: "CPC" },
  { key: "cpm", label: "CPM" },
  { key: "ctr", label: "CTR" },
];

/** 광고 지표 탭: ad-metrics-calculator 한 페이지 안에서 ?mode= 쿼리로 지표를 전환한다. */
export default function AdMetricTabs({
  active,
  onChange,
}: {
  active: AdMetricKey;
  onChange: (key: AdMetricKey) => void;
}) {
  return (
    <div className="adm-tabs" role="navigation" aria-label="Ad metric calculators">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`adm-tab${tab.key === active ? " is-active" : ""}`}
          aria-current={tab.key === active ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
