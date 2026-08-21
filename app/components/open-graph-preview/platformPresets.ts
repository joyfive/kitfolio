// 플랫폼별 링크 카드 프리셋: 차이를 컴포넌트 조건문 대신 설정 객체로 관리.
// 아래 값은 대표적인 링크 카드 형태를 기준으로 한 시뮬레이션 초기값이며,
// CSS 수정이 쉽도록 이 파일에서 관리한다.
import type { PlatformPreset } from "./types";

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "kakao",
    label: "카카오톡",
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
    label: "Facebook",
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
    label: "X",
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
    label: "Threads",
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
    label: "LinkedIn",
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
    label: "네이버 블로그",
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
    label: "Notion",
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
