/* ============================================================
   텍스트 확대·간격 검사기: preview 노드 식별자

   sanitize 모듈은 parse5 를 끌어오므로, 식별자 상수만 쓰는 쪽이
   파서 번들까지 함께 받지 않도록 따로 둔다.
   ============================================================ */

/** 원본·검사 preview 사이에서 같은 element 를 대응시키는 내부 전용 속성 */
export const NODE_ID_ATTR = "data-kf-node-id";

/** 이미지 placeholder 표시용 클래스 (base stylesheet 가 회색 박스로 그린다) */
export const IMG_PLACEHOLDER_CLASS = "kf-img-placeholder";
