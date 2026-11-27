import type { PdfTab } from "../../components/PdfToolTabs";
import type { Lang } from "../content";

type Workflow = {
  title: string;
  situation: string;
  input: string;
  output: string;
};

export const PDF_WORKFLOWS = {
  ko: {
    merge: {
      title: "여러 PDF를 한 파일로 합치기",
      situation: "계약서와 부속서류처럼 여러 PDF를 한 파일로 제출할 때 사용하세요.",
      input: "계약서.pdf + 부속서류.pdf",
      output: "계약서 다음에 부속서류가 이어지는 PDF 한 개",
    },
    split: {
      title: "필요한 페이지만 별도 파일로 나누기",
      situation: "전체 계약서를 보내기 전에 서명된 페이지만 따로 저장할 때 사용하세요.",
      input: "12페이지 PDF의 10-12 범위",
      output: "마지막 3페이지만 담긴 PDF",
    },
    rotate: {
      title: "옆으로 누운 PDF 페이지 돌리기",
      situation: "스캔한 문서에서 일부 페이지만 옆으로 누웠을 때 사용하세요.",
      input: "옆으로 누운 2·4페이지 선택 후 오른쪽 90도",
      output: "2·4페이지만 방향이 바뀐 새 PDF",
    },
    "page-delete": {
      title: "불필요한 페이지를 빼고 저장하기",
      situation: "공유할 문서에서 빈 페이지나 내부용 표지를 뺄 때 사용하세요.",
      input: "10페이지 중 빈 페이지 두 장 선택",
      output: "선택한 두 장이 빠진 8페이지 PDF",
    },
  },
  en: {
    merge: {
      title: "Combine several PDFs into one file",
      situation: "Use this when a contract and its attachments need to be submitted as one document.",
      input: "contract.pdf + attachment.pdf",
      output: "One PDF with the contract followed by the attachment",
    },
    split: {
      title: "Save just the pages you need",
      situation: "Use this to keep a signed section without sharing the entire contract.",
      input: "Pages 10-12 of a 12-page PDF",
      output: "One PDF containing only the last three pages",
    },
    rotate: {
      title: "Turn sideways pages upright",
      situation: "Use this when only some of the pages in a scan are sideways.",
      input: "Pages 2 and 4 selected, then turned 90° right",
      output: "A new PDF with only pages 2 and 4 turned",
    },
    "page-delete": {
      title: "Save a PDF without the pages you remove",
      situation: "Use this to remove blank pages or an internal cover before sharing a document.",
      input: "Two blank pages selected in a 10-page PDF",
      output: "An eight-page PDF without the two selected pages",
    },
  },
} satisfies Record<Lang, Record<PdfTab, Workflow>>;
