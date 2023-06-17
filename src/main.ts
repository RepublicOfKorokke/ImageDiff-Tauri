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

const mOnMouseClickedFunction = () => {
  comparisonClick();
};

const mOnMouseMoveFunction = (event: MouseEvent) => {
  comparisonSlide(event);
};

let mIsLeftSideVisible: boolean = true;

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
});

window.addEventListener("load", () => {
  changeCompareMode(COMPARE_MODE.CLICK);
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
  document.getElementById("left")!.style.width = "50%";
  mLeftSideImage.style.visibility = "visible";
  mRightSideImage.style.visibility = "visible";
  mImageViewer?.removeEventListener("click", mOnMouseClickedFunction);
  document.addEventListener("mousemove", mOnMouseMoveFunction);
}

function changeToClickMode() {
  document.getElementById("left")!.style.width = "100%";
  mLeftSideImage.style.visibility = "visible";
  mRightSideImage.style.visibility = "collapse";
  mIsLeftSideVisible = true;
  mImageViewer?.addEventListener("click", mOnMouseClickedFunction);
  document.removeEventListener("mousemove", mOnMouseMoveFunction);
}

function comparisonSlide(event: MouseEvent) {
  let percentX: number = (event.pageX / window.innerWidth) * 100;
  // let percentY: number = (event.pageY / window.innerHeight) * 100;
  invoke("print_log", { text: `X: ${percentX}` });
  document.getElementById("left")!.style.width = percentX.toString() + "%";
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
