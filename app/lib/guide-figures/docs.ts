/* 문서·이미지 · QR 코드 */
import type { GuideFigureMap } from "./types";

export const DOCS_FIGURES: GuideFigureMap = {
  "character-counter": {
    ko: {
      caption: "글을 붙여 넣으면 집계와 SNS 남은 분량이 바로 바뀝니다.",
      parts: [
        { t: "text", label: "텍스트 입력", value: "가볍게 들고 다니는 데일리 백. 노트북 수납 칸과 방수 원단으로 출퇴근길에도 편하게 쓸 수 있어요.", m: 1 },
        { t: "stats", items: [{ label: "글자 수", value: "55" }, { label: "(공백 제외)", value: "41" }, { label: "바이트", value: "133" }], m: 2 },
        { t: "rows", title: "SNS 글자 수 제한", items: [{ label: "X (Twitter) · 280", value: "225 남음", tone: "ok" }, { label: "Instagram · 2,200", value: "2,145 남음", tone: "ok" }], m: 3 },
      ],
      notes: [
        { title: "텍스트 입력", body: "직접 쓰거나 다른 곳에서 쓴 초안을 붙여 넣으세요. 입력하는 동안 아래 숫자가 계속 갱신됩니다." },
        { title: "글자 수 · 공백 제외 · 바이트", body: "제출처가 공백을 세는지, 바이트로 제한하는지 먼저 확인하고 그 기준의 숫자를 보세요. 단어·문장·줄 수도 같은 영역에 있습니다." },
        { title: "SNS 글자 수 제한", body: "플랫폼별 한도에서 남은 분량을 보여줍니다. 한도를 넘으면 초과로 바뀌니 그만큼 줄이면 됩니다." },
      ],
    },
    en: {
      caption: "Paste your text and the counts and social limits update immediately.",
      parts: [
        { t: "text", label: "Text input", value: "A light everyday bag with a laptop sleeve and water-resistant fabric for the daily commute.", m: 1 },
        { t: "stats", items: [{ label: "Characters", value: "91" }, { label: "(no spaces)", value: "77" }, { label: "Bytes", value: "91" }], m: 2 },
        { t: "rows", title: "Social media limits", items: [{ label: "X (Twitter) · 280", value: "189 left", tone: "ok" }, { label: "Instagram · 2,200", value: "2,109 left", tone: "ok" }], m: 3 },
      ],
      notes: [
        { title: "Text input", body: "Type here or paste a draft from elsewhere. The numbers below update as you type." },
        { title: "Characters · no spaces · bytes", body: "Check whether the destination counts spaces or limits bytes, then read the matching number. Word, sentence and line counts sit in the same area." },
        { title: "Social media limits", body: "Shows how much room is left on each platform. Past the limit the label switches to over, so trim by that amount." },
      ],
    },
  },

  "pdf-tools/merge": {
    ko: {
      caption: "합칠 PDF를 올리고 순서를 정한 뒤 한 파일로 받습니다.",
      parts: [
        { t: "tabs", items: ["PDF 병합", "PDF 분할", "PDF 회전", "페이지 삭제"], m: 1 },
        { t: "drop", title: "PDF 파일 선택", hint: "여기에 끌어다 놓을 수도 있어요 · 최대 30개", m: 2 },
        { t: "rows", title: "병합 순서", items: [{ label: "1. 계약서.pdf", value: "8페이지" }, { label: "2. 부속서류.pdf", value: "4페이지" }], m: 3 },
        { t: "buttons", items: ["PDF 병합"], m: 4 },
      ],
      notes: [
        { title: "작업 탭", body: "병합 탭을 고르세요. 탭마다 파일을 따로 다루므로 다른 탭으로 옮겨도 이 탭의 파일은 그대로입니다." },
        { title: "PDF 파일 선택", body: "합칠 원본을 두 개 이상 추가합니다. 파일은 서버로 올라가지 않고 브라우저 안에서만 처리됩니다." },
        { title: "병합 순서", body: "위·아래 버튼이나 드래그로 완성본에서 읽힐 순서를 정하세요. 총 페이지 수도 함께 확인할 수 있습니다." },
        { title: "PDF 병합", body: "실행 후 병합된 PDF를 내려받아 열고, 페이지가 의도한 순서인지 확인하세요." },
      ],
    },
    en: {
      caption: "Add the PDFs, set their order, then download one combined file.",
      parts: [
        { t: "tabs", items: ["Merge PDF", "Split PDF", "Rotate PDF", "Delete pages"], m: 1 },
        { t: "drop", title: "Choose PDF files", hint: "Or drag files here · up to 30", m: 2 },
        { t: "rows", title: "Merge order", items: [{ label: "1. contract.pdf", value: "8 pages" }, { label: "2. attachment.pdf", value: "4 pages" }], m: 3 },
        { t: "buttons", items: ["Merge PDF"], m: 4 },
      ],
      notes: [
        { title: "Task tabs", body: "Choose Merge. Each tab keeps its own files, so switching tabs does not clear this one." },
        { title: "Choose PDF files", body: "Add two or more source files. They stay in your browser and are never uploaded." },
        { title: "Merge order", body: "Drag the files or use the up and down buttons to set the reading order. The total page count is shown alongside." },
        { title: "Merge PDF", body: "Download the merged file, open it and check that the pages appear in the intended order." },
      ],
    },
  },

  "pdf-tools/split": {
    ko: {
      caption: "PDF 한 개를 올리고 나눌 방식과 범위를 정합니다.",
      parts: [
        { t: "tabs", items: ["PDF 병합", "PDF 분할", "PDF 회전", "페이지 삭제"], active: 1, m: 1 },
        { t: "tabs", label: "분할 방식", items: ["페이지별 분할", "범위별 분할"], active: 1, m: 2 },
        { t: "field", label: "페이지 범위", value: "10-12", hint: "예: 1-3, 4-7, 8, 9-12", m: 3 },
        { t: "buttons", items: ["PDF 분할"], m: 4 },
      ],
      notes: [
        { title: "분할 탭", body: "분할 탭에서 원본 PDF 한 개를 추가하세요. 최대 300페이지까지 다룹니다." },
        { title: "분할 방식", body: "모든 페이지를 한 장씩 나누려면 페이지별, 원하는 부분만 가져오려면 범위별 분할을 고르세요." },
        { title: "페이지 범위", body: "쉼표로 구분한 범위 하나가 결과 파일 하나가 됩니다. 10-12처럼 쓰면 그 세 페이지만 담긴 PDF가 나옵니다." },
        { title: "PDF 분할", body: "결과가 한 개면 PDF로, 두 개 이상이면 ZIP으로 내려받습니다." },
      ],
    },
    en: {
      caption: "Add one PDF, then choose how and where to split it.",
      parts: [
        { t: "tabs", items: ["Merge PDF", "Split PDF", "Rotate PDF", "Delete pages"], active: 1, m: 1 },
        { t: "tabs", label: "Split mode", items: ["Split every page", "Split by ranges"], active: 1, m: 2 },
        { t: "field", label: "Page ranges", value: "10-12", hint: "e.g. 1-3, 4-7, 8, 9-12", m: 3 },
        { t: "buttons", items: ["Split PDF"], m: 4 },
      ],
      notes: [
        { title: "Split tab", body: "Add one source PDF in the Split tab. Files of up to 300 pages are supported." },
        { title: "Split mode", body: "Choose every page to get one file per page, or ranges to keep only the parts you need." },
        { title: "Page ranges", body: "Each comma separated range becomes one output file. Entering 10-12 gives a PDF with just those three pages." },
        { title: "Split PDF", body: "One result downloads as a PDF. Two or more download together as a ZIP." },
      ],
    },
  },

  "pdf-tools/rotate": {
    ko: {
      caption: "방향을 바꿀 페이지만 골라 돌린 뒤 새 PDF로 저장합니다.",
      parts: [
        { t: "tabs", items: ["PDF 병합", "PDF 분할", "PDF 회전", "페이지 삭제"], active: 2, m: 1 },
        { t: "pages", items: [{ label: "1" }, { label: "2", state: "turn" }, { label: "3" }, { label: "4", state: "turn" }], m: 2 },
        { t: "buttons", items: ["왼쪽 90°", "180°", "오른쪽 90°"], primary: 2, m: 3 },
        { t: "buttons", items: ["회전된 PDF 저장"], m: 4 },
      ],
      notes: [
        { title: "회전 탭", body: "회전 탭에서 PDF 한 개를 추가하면 페이지 썸네일이 나타납니다." },
        { title: "페이지 선택", body: "썸네일을 눌러 돌릴 페이지를 고르세요. 1-3, 5처럼 범위로 선택할 수도 있고, 아무것도 고르지 않으면 전체에 적용됩니다." },
        { title: "회전 방향", body: "왼쪽 90°, 오른쪽 90°, 180° 중 고르면 썸네일에 바로 반영됩니다. 원상 복구 버튼으로 되돌릴 수 있습니다." },
        { title: "회전된 PDF 저장", body: "새 PDF를 열어 바꾼 페이지와 그대로 둔 페이지를 모두 확인하세요." },
      ],
    },
    en: {
      caption: "Pick just the pages that need turning, rotate them and save a new PDF.",
      parts: [
        { t: "tabs", items: ["Merge PDF", "Split PDF", "Rotate PDF", "Delete pages"], active: 2, m: 1 },
        { t: "pages", items: [{ label: "1" }, { label: "2", state: "turn" }, { label: "3" }, { label: "4", state: "turn" }], m: 2 },
        { t: "buttons", items: ["Left 90°", "180°", "Right 90°"], primary: 2, m: 3 },
        { t: "buttons", items: ["Save rotated PDF"], m: 4 },
      ],
      notes: [
        { title: "Rotate tab", body: "Add one PDF in the Rotate tab and the page thumbnails appear." },
        { title: "Select pages", body: "Click thumbnails to choose the pages to turn, or select a range such as 1-3, 5. With nothing selected, the rotation applies to every page." },
        { title: "Direction", body: "Choose left 90°, right 90° or 180° and the thumbnails update at once. The reset buttons undo the change." },
        { title: "Save rotated PDF", body: "Open the new PDF and check both the pages you turned and the ones you left alone." },
      ],
    },
  },

  "pdf-tools/page-delete": {
    ko: {
      caption: "뺄 페이지를 표시하고 남는 페이지 수를 확인한 뒤 저장합니다.",
      parts: [
        { t: "tabs", items: ["PDF 병합", "PDF 분할", "PDF 회전", "페이지 삭제"], active: 3, m: 1 },
        { t: "pages", items: [{ label: "1" }, { label: "2", state: "off" }, { label: "3" }, { label: "4" }, { label: "5", state: "off" }], m: 2 },
        { t: "rows", items: [{ label: "삭제 예정", value: "2페이지" }, { label: "삭제 후 남는 페이지", value: "8페이지", tone: "ok" }], m: 3 },
        { t: "buttons", items: ["선택 페이지 삭제"], m: 4 },
      ],
      notes: [
        { title: "페이지 삭제 탭", body: "페이지 삭제 탭에서 원본 PDF 한 개를 추가하세요." },
        { title: "삭제할 페이지 선택", body: "썸네일을 눌러 뺄 페이지를 표시합니다. 2, 5-7처럼 범위로 고르거나 선택 반전도 쓸 수 있습니다." },
        { title: "남는 페이지", body: "삭제 예정과 남는 페이지 수를 확인하세요. 최소 1페이지는 남아야 실행됩니다." },
        { title: "선택 페이지 삭제", body: "내려받은 PDF에 필요한 페이지가 모두 있는지 확인하세요. 실행 취소로 바로 되돌릴 수 있습니다." },
      ],
    },
    en: {
      caption: "Mark the pages to remove, check what remains, then save.",
      parts: [
        { t: "tabs", items: ["Merge PDF", "Split PDF", "Rotate PDF", "Delete pages"], active: 3, m: 1 },
        { t: "pages", items: [{ label: "1" }, { label: "2", state: "off" }, { label: "3" }, { label: "4" }, { label: "5", state: "off" }], m: 2 },
        { t: "rows", items: [{ label: "Marked for deletion", value: "2 pages" }, { label: "Pages remaining after delete", value: "8 pages", tone: "ok" }], m: 3 },
        { t: "buttons", items: ["Delete selected pages"], m: 4 },
      ],
      notes: [
        { title: "Delete pages tab", body: "Add the original PDF in the Delete pages tab." },
        { title: "Select pages to delete", body: "Click thumbnails to mark pages, select a range such as 2, 5-7, or invert the selection." },
        { title: "Pages remaining", body: "Check how many pages are marked and how many remain. At least one page has to stay." },
        { title: "Delete selected pages", body: "Check that the downloaded PDF still has every page you need. Undo reverses the last change." },
      ],
    },
  },

  "image-optimizer": {
    ko: {
      caption: "이미지를 추가하고 출력 포맷과 품질을 정한 뒤 용량을 비교합니다.",
      parts: [
        { t: "drop", title: "이미지를 여기에 놓으세요", hint: "또는 파일 선택 · PNG · JPG · WebP", m: 1 },
        { t: "tabs", label: "출력 포맷", items: ["WebP", "JPG", "PNG"], m: 2 },
        { t: "slider", label: "품질", value: "80", pct: 80, m: 3 },
        { t: "rows", items: [{ label: "hero.png · 원본", value: "1.84 MB" }, { label: "결과 · WebP", value: "212 KB" }, { label: "절감", value: "−88%", tone: "ok" }], m: 4 },
      ],
      notes: [
        { title: "이미지 추가", body: "PNG·JPG·WebP 파일을 끌어다 놓거나 고르세요. 여러 장을 한 번에 넣을 수 있고, 이미지는 서버로 올라가지 않습니다." },
        { title: "출력 포맷", body: "웹에 올릴 사진은 WebP나 JPG가 보통 가장 가볍습니다. PNG는 픽셀을 그대로 두고 무손실로 다시 저장합니다." },
        { title: "품질", body: "숫자를 낮출수록 용량이 줄지만 경계가 뭉개질 수 있습니다. 80 안팎에서 시작해 결과를 보고 조절하세요." },
        { title: "용량 비교와 다운로드", body: "이미지 최적화를 실행하면 원본과 결과 용량, 절감률이 나옵니다. 한 장씩 받거나 전체를 ZIP으로 받으세요." },
      ],
    },
    en: {
      caption: "Add images, pick an output format and quality, then compare file sizes.",
      parts: [
        { t: "drop", title: "Drop images here", hint: "or choose files · PNG · JPG · WebP", m: 1 },
        { t: "tabs", label: "Output format", items: ["WebP", "JPG", "PNG"], m: 2 },
        { t: "slider", label: "Quality", value: "80", pct: 80, m: 3 },
        { t: "rows", items: [{ label: "hero.png · original", value: "1.84 MB" }, { label: "Result · WebP", value: "212 KB" }, { label: "Saved", value: "−88%", tone: "ok" }], m: 4 },
      ],
      notes: [
        { title: "Add images", body: "Drop or choose PNG, JPG or WebP files. You can add several at once, and nothing is uploaded." },
        { title: "Output format", body: "WebP or JPG is usually lightest for photos on the web. PNG keeps every pixel and saves losslessly." },
        { title: "Quality", body: "Lower numbers make smaller files but can soften edges. Start around 80 and adjust after checking the result." },
        { title: "Compare and download", body: "Run Optimize images to see the original size, the result and the saving. Download one file or everything as a ZIP." },
      ],
    },
  },

  "image-resizer-cropper": {
    ko: {
      caption: "편집 모드를 고르고 크기나 비율을 맞춘 뒤 결과 크기를 확인합니다.",
      parts: [
        { t: "tabs", label: "편집 모드", items: ["Resize", "Crop"], active: 1, m: 1 },
        { t: "chips", label: "비율", items: ["자유", "1:1", "4:5", "16:9"], active: [1], m: 2 },
        { t: "fields", items: [{ label: "결과 가로 (px)", value: "1080" }, { label: "결과 세로 (px)", value: "1080" }], m: 3 },
        { t: "buttons", items: ["이미지 자르기"], m: 4 },
      ],
      notes: [
        { title: "편집 모드", body: "픽셀 크기만 바꾸려면 Resize, 일부 영역을 잘라 비율을 맞추려면 Crop을 고르세요. 먼저 이미지를 추가해야 합니다." },
        { title: "비율", body: "1:1이나 16:9 같은 비율을 고르면 미리보기의 선택 영역이 그 비율로 고정됩니다. 영역은 끌어서 옮기고 모서리로 크기를 바꿉니다." },
        { title: "저장할 크기", body: "제출처가 요구하는 픽셀 값을 입력하세요. 원본보다 크게 만들면 흐릿해질 수 있다는 경고가 나옵니다." },
        { title: "실행과 다운로드", body: "결과 크기와 파일 용량을 확인한 뒤 내려받으세요. 출력 포맷과 품질도 같은 화면에서 고를 수 있습니다." },
      ],
    },
    en: {
      caption: "Choose an edit mode, set the size or ratio, then check the output size.",
      parts: [
        { t: "tabs", label: "Edit mode", items: ["Resize", "Crop"], active: 1, m: 1 },
        { t: "chips", label: "Ratio", items: ["Free", "1:1", "4:5", "16:9"], active: [1], m: 2 },
        { t: "fields", items: [{ label: "Output width (px)", value: "1080" }, { label: "Output height (px)", value: "1080" }], m: 3 },
        { t: "buttons", items: ["Crop image"], m: 4 },
      ],
      notes: [
        { title: "Edit mode", body: "Choose Resize to change pixel dimensions only, or Crop to cut an area to a set ratio. Add an image first." },
        { title: "Ratio", body: "Picking 1:1 or 16:9 locks the selection box in the preview to that ratio. Drag the box to move it and its corners to resize." },
        { title: "Output size", body: "Enter the pixel size the destination requires. Going larger than the original shows a warning that the image may blur." },
        { title: "Run and download", body: "Check the output dimensions and file size, then download. Output format and quality are on the same screen." },
      ],
    },
  },

  "qr-code-generator": {
    ko: {
      caption: "주소를 넣고 인식 품질과 모양을 정한 뒤, 판독 확인 후 내려받습니다.",
      parts: [
        { t: "field", label: "URL", value: "https://example.com/menu", m: 1 },
        { t: "tabs", label: "인식 품질", items: ["일반", "높음", "최고"], active: 2, m: 2 },
        { t: "chips", label: "모양", items: ["사각형", "둥근 사각형", "아치형", "하트형"], active: [0], m: 3 },
        { t: "rows", items: [{ label: "상태", value: "QR 코드 인식을 확인했습니다", tone: "ok" }] },
        { t: "buttons", items: ["SVG 다운로드", "PNG 다운로드"], primary: 1, m: 4 },
      ],
      notes: [
        { title: "URL", body: "QR로 열릴 주소를 http 또는 https로 시작하게 입력하세요. 주소가 바뀌면 미리보기도 바로 바뀝니다." },
        { title: "인식 품질", body: "인쇄물이 접히거나 로고가 덮일 수 있다면 높음이나 최고를 고르세요. 품질이 높을수록 점이 촘촘해집니다." },
        { title: "모양과 색상", body: "셀 모양, QR 색상, 배경 색상을 정합니다. 대비가 낮으면 인식이 어려울 수 있다는 경고가 나옵니다." },
        { title: "다운로드", body: "인식 확인 메시지가 보이면 인쇄용은 SVG, 화면용은 PNG로 받으세요. 인쇄 전에 휴대폰으로 한 번 더 읽어 보세요." },
      ],
    },
    en: {
      caption: "Enter the URL, set recognition quality and shape, then download once it reads correctly.",
      parts: [
        { t: "field", label: "URL", value: "https://example.com/menu", m: 1 },
        { t: "tabs", label: "Recognition quality", items: ["Standard", "High", "Highest"], active: 2, m: 2 },
        { t: "chips", label: "Shape", items: ["Square", "Rounded", "Arch", "Heart"], active: [0], m: 3 },
        { t: "rows", items: [{ label: "Status", value: "QR code verified", tone: "ok" }] },
        { t: "buttons", items: ["Download SVG", "Download PNG"], primary: 1, m: 4 },
      ],
      notes: [
        { title: "URL", body: "Enter the address the code should open, starting with http or https. The preview updates as you type." },
        { title: "Recognition quality", body: "Choose High or Highest if the print may get folded or covered by a logo. Higher quality packs the dots more densely." },
        { title: "Shape and colors", body: "Set the module shape, QR color and background color. A warning appears if the contrast may be too low to scan." },
        { title: "Download", body: "Once the verified message appears, use SVG for print and PNG for screens. Scan the code with a phone before printing." },
      ],
    },
  },

  "qr-code-reader": {
    ko: {
      caption: "이미지나 카메라로 QR을 읽고, 주소를 확인한 뒤 열거나 복사합니다.",
      parts: [
        { t: "tabs", items: ["붙여넣기", "이미지 업로드", "카메라"], active: 1, m: 1 },
        { t: "drop", title: "이미지를 여기로 끌어다 놓거나 파일을 선택하세요.", hint: "PNG · JPG · WebP", m: 2 },
        { t: "rows", items: [{ label: "판독 결과", value: "https://example.com/event" }, { label: "도메인", value: "example.com" }], m: 3 },
        { t: "buttons", items: ["주소 복사", "링크 열기"], m: 4 },
      ],
      notes: [
        { title: "읽는 방법", body: "캡처한 QR은 붙여넣기, 받은 파일은 이미지 업로드, 눈앞의 코드는 카메라 탭을 쓰세요." },
        { title: "이미지 넣기", body: "파일을 끌어다 놓거나 고르면 바로 판독합니다. 이미지는 브라우저 안에서만 처리됩니다." },
        { title: "판독 결과", body: "QR에 담긴 주소나 원문 텍스트가 나옵니다. 주소라면 도메인을 따로 보여주니 열기 전에 확인하세요." },
        { title: "복사하거나 열기", body: "주소를 확인한 뒤 복사하거나 새 탭으로 여세요. 다른 이미지는 다시 읽기로 이어서 판독합니다." },
      ],
    },
    en: {
      caption: "Read a QR code from an image or camera, check the address, then open or copy it.",
      parts: [
        { t: "tabs", items: ["Paste", "Upload image", "Camera"], active: 1, m: 1 },
        { t: "drop", title: "Drag an image here or choose a file.", hint: "PNG · JPG · WebP", m: 2 },
        { t: "rows", items: [{ label: "Decoded", value: "https://example.com/event" }, { label: "Domain", value: "example.com" }], m: 3 },
        { t: "buttons", items: ["Copy URL", "Open link"], m: 4 },
      ],
      notes: [
        { title: "How to read", body: "Use Paste for a screenshot, Upload image for a file you received, and Camera for a code in front of you." },
        { title: "Add the image", body: "Drop or choose a file and decoding starts right away. The image is processed only in your browser." },
        { title: "Decoded result", body: "Shows the URL or text stored in the code. For URLs the domain is shown separately so you can check it before opening." },
        { title: "Copy or open", body: "After checking the address, copy it or open it in a new tab. Use read again for the next image." },
      ],
    },
  },
};
