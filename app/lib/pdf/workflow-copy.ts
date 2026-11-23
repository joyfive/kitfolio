import type { PdfTab } from "../../components/PdfToolTabs";
import type { Lang } from "../content";

type Workflow = {
  title: string;
  situation: string;
  steps: ReadonlyArray<{ title: string; detail: string }>;
  input: string;
  output: string;
};

export const PDF_WORKFLOWS = {
  ko: {
    merge: {
      title: "여러 PDF를 한 파일로 합치기",
      situation: "계약서와 부속서류처럼 여러 PDF를 한 파일로 제출할 때 사용하세요.",
      steps: [
        { title: "PDF 파일 선택", detail: "병합 탭에 합칠 원본을 두 개 이상 추가하세요." },
        { title: "파일 순서 확인", detail: "위·아래 버튼이나 드래그로 완성본에서 읽힐 순서를 정하세요." },
        { title: "PDF 병합 후 다운로드", detail: "병합된 PDF를 받아 열고 페이지가 의도한 순서인지 확인하세요." },
      ],
      input: "계약서.pdf + 부속서류.pdf",
      output: "계약서 다음에 부속서류가 이어지는 PDF 한 개",
    },
    split: {
      title: "필요한 페이지만 별도 파일로 나누기",
      situation: "전체 계약서를 보내기 전에 서명된 페이지만 따로 저장할 때 사용하세요.",
      steps: [
        { title: "PDF 한 개 선택", detail: "분할 탭에 원본 PDF를 추가하세요." },
        { title: "나눌 범위 입력", detail: "원하는 페이지만 가져오려면 범위로 분할을 선택하고 10-12처럼 입력하세요." },
        { title: "분할 결과 저장", detail: "결과가 한 개면 PDF, 여러 개면 ZIP으로 받습니다." },
      ],
      input: "12페이지 PDF의 10-12 범위",
      output: "마지막 3페이지만 담긴 PDF",
    },
    rotate: {
      title: "옆으로 누운 PDF 페이지 돌리기",
      situation: "스캔한 문서에서 일부 페이지만 옆으로 누웠을 때 사용하세요.",
      steps: [
        { title: "PDF 한 개 선택", detail: "회전 탭에 문서를 추가하고 방향을 바꿀 페이지를 선택하세요." },
        { title: "회전 방향 고르기", detail: "왼쪽 90도, 오른쪽 90도, 180도 중 올바른 방향을 고르세요." },
        { title: "결과 다운로드", detail: "새 PDF를 열어 선택한 페이지와 그대로 둔 페이지를 확인하세요." },
      ],
      input: "옆으로 누운 2·4페이지 선택 후 오른쪽 90도",
      output: "2·4페이지만 방향이 바뀐 새 PDF",
    },
    "page-delete": {
      title: "불필요한 페이지를 빼고 저장하기",
      situation: "공유할 문서에서 빈 페이지나 내부용 표지를 뺄 때 사용하세요.",
      steps: [
        { title: "PDF 한 개 선택", detail: "페이지 삭제 탭에 원본 PDF를 추가하세요." },
        { title: "뺄 페이지 선택", detail: "썸네일에서 삭제할 페이지를 표시하고 남는 페이지 수를 확인하세요." },
        { title: "새 PDF 다운로드", detail: "최소 1페이지를 남긴 뒤 실행하고, 결과에 필요한 페이지가 모두 있는지 확인하세요." },
      ],
      input: "10페이지 중 빈 페이지 두 장 선택",
      output: "선택한 두 장이 빠진 8페이지 PDF",
    },
  },
  en: {
    merge: {
      title: "Combine several PDFs into one file",
      situation: "Use this when a contract and its attachments need to be submitted as one document.",
      steps: [
        { title: "Choose PDF files", detail: "Add at least two source files in the Merge tab." },
        { title: "Check the order", detail: "Drag the files or use the up and down buttons to set the reading order." },
        { title: "Merge and download", detail: "Open the downloaded PDF and check that the pages appear in the intended order." },
      ],
      input: "contract.pdf + attachment.pdf",
      output: "One PDF with the contract followed by the attachment",
    },
    split: {
      title: "Save just the pages you need",
      situation: "Use this to keep a signed section without sharing the entire contract.",
      steps: [
        { title: "Choose one PDF", detail: "Add the source document in the Split tab." },
        { title: "Enter a page range", detail: "Choose the range option and enter a range such as 10-12." },
        { title: "Download the result", detail: "A single result downloads as a PDF. Multiple results download together as a ZIP." },
      ],
      input: "Pages 10-12 of a 12-page PDF",
      output: "One PDF containing only the last three pages",
    },
    rotate: {
      title: "Turn sideways pages upright",
      situation: "Use this when only some of the pages in a scan are sideways.",
      steps: [
        { title: "Choose one PDF", detail: "Add the document in Rotate and select the pages that need turning." },
        { title: "Pick a direction", detail: "Choose 90° left, 90° right, or 180°." },
        { title: "Download and check", detail: "Open the new PDF and check both the changed and unchanged pages." },
      ],
      input: "Pages 2 and 4 selected, then turned 90° right",
      output: "A new PDF with only pages 2 and 4 turned",
    },
    "page-delete": {
      title: "Save a PDF without the pages you remove",
      situation: "Use this to remove blank pages or an internal cover before sharing a document.",
      steps: [
        { title: "Choose one PDF", detail: "Add the original document in the Delete Pages tab." },
        { title: "Select pages to remove", detail: "Mark the pages by thumbnail and verify the number of pages that will remain." },
        { title: "Download the new PDF", detail: "Leave at least one page, then check that the downloaded file still includes everything you need." },
      ],
      input: "Two blank pages selected in a 10-page PDF",
      output: "An eight-page PDF without the two selected pages",
    },
  },
} satisfies Record<Lang, Record<PdfTab, Workflow>>;
