// 플랫폼별 링크 카드 프리셋: 차이를 컴포넌트 조건문 대신 설정 객체로 관리.
// 아래 값은 대표적인 링크 카드 형태를 기준으로 한 시뮬레이션 초기값이며,
// CSS 수정이 쉽도록 이 파일에서 관리한다.
import type { PlatformPreset } from "./types";

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "kakao",
    label: { ko: "카카오톡", en: "KakaoTalk" },
    layout: "stacked",
    imageAspectRatio: 1.91,
    titleLines: 2,
    descriptionLines: 2,
    showDescription: true,
    showDomain: true,
    imagePosition: "top",
  },
  {
    id: "facebook",
    label: { ko: "Facebook", en: "Facebook" },
    layout: "stacked",
    imageAspectRatio: 1.91,
    titleLines: 2,
    descriptionLines: 2,
    showDescription: true,
    showDomain: true,
    imagePosition: "top",
  },
  {
    id: "x",
    label: { ko: "X", en: "X" },
    layout: "stacked",
    imageAspectRatio: 2,
    titleLines: 2,
    descriptionLines: 1,
    showDescription: true,
    showDomain: true,
    imagePosition: "top",
  },
  {
    id: "threads",
    label: { ko: "Threads", en: "Threads" },
    layout: "stacked",
    imageAspectRatio: 1.91,
    titleLines: 2,
    descriptionLines: 1,
    showDescription: true,
    showDomain: true,
    imagePosition: "top",
  },
  {
    id: "linkedin",
    label: { ko: "LinkedIn", en: "LinkedIn" },
    layout: "stacked",
    imageAspectRatio: 1.91,
    titleLines: 2,
    descriptionLines: 1,
    showDescription: true,
    showDomain: true,
    imagePosition: "top",
  },
  {
    id: "naver-blog",
    label: { ko: "네이버 블로그", en: "Naver Blog" },
    layout: "horizontal-left",
    imageAspectRatio: 1,
    titleLines: 2,
    descriptionLines: 2,
    showDescription: true,
    showDomain: true,
    imagePosition: "left",
  },
  {
    id: "notion",
    label: { ko: "Notion", en: "Notion" },
    layout: "horizontal-right",
    imageAspectRatio: 4 / 3,
    titleLines: 2,
    descriptionLines: 2,
    showDescription: true,
    showDomain: true,
    imagePosition: "right",
  },
];

export function getPreset(id: string): PlatformPreset {
  return PLATFORM_PRESETS.find((p) => p.id === id) ?? PLATFORM_PRESETS[0];
}
