import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";

const COMPARE_MODE = {
  SLIDE: 0,
  CLICK: 1,
  FADE: 2,
} as const;
type COMPARE_MODE = (typeof COMPARE_MODE)[keyof typeof COMPARE_MODE];

const mLeftSideImage = document.getElementById(
  "leftSideImage"
) as HTMLImageElement;
const mLeftSideButton = document.getElementById(
  "buttonOpenLeftSideImage"
) as HTMLImageElement;
const mRightSideImage = document.getElementById(
  "rightSideImage"
) as HTMLImageElement;
const mRightSideButton = document.getElementById(
  "buttonOpenRightSideImage"
) as HTMLImageElement;

const mImageViewer = document.getElementById("imageViewer");
const mImageDivider = document.getElementById("imageDivider");
const mImageLeftArea = document.getElementById("leftArea");

const mContextMenu = document.getElementById("contextmenu");
const mOptionSlideButton = document.getElementById(
  "optionSlide"
) as HTMLImageElement;
const mOptionClickButton = document.getElementById(
  "optionClick"
) as HTMLImageElement;
const mOptionZoomButton = document.getElementById(
  "optionZoom"
) as HTMLImageElement;
const mOptionDissolveRange = document.getElementById(
  "dissolve"
) as HTMLInputElement;

const mOnMouseClickedFunction = () => {
  comparisonClick();
};
const mOnMouseMoveFunction = (event: MouseEvent) => {
  comparisonSlide(event);
};

let mIsLeftSideVisible: boolean = true;
let mIsZoomed: boolean = false;

document.addEventListener("DOMContentLoaded", () => {
  mLeftSideButton?.addEventListener("click", () =>
    selectImage((path) => {
      setImage(path, true);
    })
  );
  mRightSideButton?.addEventListener("click", () =>
    selectImage((path) => {
      setImage(path, false);
    })
  );

  mOptionSlideButton?.addEventListener("click", () =>
    changeCompareMode(COMPARE_MODE.SLIDE)
  );
  mOptionClickButton?.addEventListener("click", () =>
    changeCompareMode(COMPARE_MODE.CLICK)
  );
  mOptionZoomButton?.addEventListener("click", () => toggleZoom());
  mOptionDissolveRange.addEventListener("input", () => changeDissolveValue());
});

document.body.addEventListener("contextmenu", (event) => {
  invoke("print_log", { text: `contextmenu` });
  mContextMenu!.style.left = event.pageX + "px";
  mContextMenu!.style.top = event.pageY + "px";
  mContextMenu!.style.display = "flex";
});

document.body.addEventListener("click", function () {
  mContextMenu!.style.display = "none";
});

window.addEventListener("load", () => {
  changeCompareMode(COMPARE_MODE.SLIDE);
});

async function selectImage(onSelected: (path: string) => void) {
  const path = await open({
    multiple: false,
    filters: [
      {
        name: "Image",
        extensions: ["png", "jpg", "jpeg", "bmp", "webp"],
      },
    ],
  });
  if (path) {
    invoke("print_log", { text: `Selected image: ${path}` });

    let element = new Image();
    element.onload = function () {
      var width = element.naturalWidth;
      var height = element.naturalHeight;
      changeWindowSize(width, height);
    };
    element.src = convertFileSrc(path as string);
    onSelected(path as string);
  } else {
    invoke("print_log", { text: "Canceled" });
  }
}

async function changeWindowSize(width: number, height: number) {
  width = width > 1280 ? 1280 : width;
  height = height > 720 ? 720 : height;
  appWindow.setSize(new LogicalSize(width, height));
}

function setImage(path: string, isLeftSide: boolean) {
  let pathSrc = convertFileSrc(path as string);
  let targetImage = isLeftSide ? mLeftSideImage : mRightSideImage;
  let targetButton = isLeftSide ? mLeftSideButton : mRightSideButton;

  if (targetImage) {
    targetImage.src = pathSrc;
  }
  if (targetButton) {
    targetButton.textContent = path.substring(path.lastIndexOf("/") + 1);
  }
}

function changeCompareMode(mode: COMPARE_MODE) {
  switch (mode) {
    case COMPARE_MODE.SLIDE:
      changeToSlideMode();
      break;
    case COMPARE_MODE.CLICK:
      changeToClickMode();
      break;
    case COMPARE_MODE.FADE:
      break;
    default:
      break;
  }
}

function changeToSlideMode() {
  mImageLeftArea!.style.width = "50%";
  mLeftSideImage.style.visibility = "visible";
  mRightSideImage.style.visibility = "visible";
  mImageDivider!.style.display = "block";
  mImageViewer?.removeEventListener("click", mOnMouseClickedFunction);
  document.addEventListener("mousemove", mOnMouseMoveFunction);
}

function changeToClickMode() {
  mImageLeftArea!.style.width = "100%";
  mLeftSideImage.style.visibility = "visible";
  mRightSideImage.style.visibility = "collapse";
  mImageDivider!.style.display = "none";
  mIsLeftSideVisible = true;
  mImageViewer?.addEventListener("click", mOnMouseClickedFunction);
  document.removeEventListener("mousemove", mOnMouseMoveFunction);
}

function comparisonSlide(event: MouseEvent) {
  let percentX: string = event.clientX + 10 + "px";
  // let percentY: number = (event.pageY / window.innerHeight) * 100;
  invoke("print_log", { text: `X: ${percentX}` });
  mImageLeftArea!.style.width = percentX;
  mImageDivider!.style.left = percentX;
}

function comparisonClick() {
  invoke("print_log", { text: `Clicked` });
  if (mIsLeftSideVisible) {
    mLeftSideImage.style.visibility = "collapse";
    mRightSideImage.style.visibility = "visible";
  } else {
    mLeftSideImage.style.visibility = "visible";
    mRightSideImage.style.visibility = "collapse";
  }
  mIsLeftSideVisible = !mIsLeftSideVisible;
}

function toggleZoom() {
  if (mIsZoomed) {
    mImageViewer!.style.transform = "scale(1.0)";
  } else {
    mImageViewer!.style.transform = "scale(2.0)";
  }
  mIsZoomed = !mIsZoomed;
}

function changeDissolveValue() {
  let range = mOptionDissolveRange.value;
  invoke("print_log", { text: `dissolve range: ${range}` });
}
