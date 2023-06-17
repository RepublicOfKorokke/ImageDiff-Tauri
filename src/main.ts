import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";

const COMPARE_MODE = {
  SLIDE: 0,
  CLICK: 1,
  FADE: 2,
} as const;
type COMPARE_MODE = (typeof COMPARE_MODE)[keyof typeof COMPARE_MODE];

const leftSideImage = document.getElementById(
  "leftSideImage"
) as HTMLImageElement;

const leftSideButton = document.getElementById(
  "buttonOpenLeftSideImage"
) as HTMLImageElement;

const rightSideImage = document.getElementById(
  "rightSideImage"
) as HTMLImageElement;

const rightSideButton = document.getElementById(
  "buttonOpenRightSideImage"
) as HTMLImageElement;

let isLeftSideVisible: boolean = true;

document.addEventListener("DOMContentLoaded", () => {
  leftSideButton?.addEventListener("click", () =>
    selectImage((path) => {
      setImage(path, true);
    })
  );
  rightSideButton?.addEventListener("click", () =>
    selectImage((path) => {
      setImage(path, false);
    })
  );
});

window.addEventListener("load", () => {
  compareImage(COMPARE_MODE.SLIDE);
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
  let targetImage = isLeftSide ? leftSideImage : rightSideImage;
  let targetButton = isLeftSide ? leftSideButton : rightSideButton;

  if (targetImage) {
    targetImage.src = pathSrc;
  }
  if (targetButton) {
    targetButton.textContent = path.substring(path.lastIndexOf("/") + 1);
  }
}

function compareImage(mode: COMPARE_MODE) {
  switch (mode) {
    case COMPARE_MODE.SLIDE:
      document.addEventListener("mousemove", (event) => {
        comparisonSlide(event);
      });
      break;
    case COMPARE_MODE.CLICK:
      invoke("print_log", { text: "COMPARE_MODE.CLICK" });
      document.removeEventListener("mousemove", (event) => {
        comparisonSlide(event);
      });
      comparisonClick();
      break;
    case COMPARE_MODE.FADE:
      break;
    default:
      break;
  }
}

function comparisonSlide(event: MouseEvent) {
  let percentX: number = (event.pageX / window.innerWidth) * 100;
  // let percentY: number = (event.pageY / window.innerHeight) * 100;
  invoke("print_log", { text: `X: ${percentX}` });
  document.getElementById("left")!.style.width = percentX.toString() + "%";
}

function comparisonClick() {
  if (isLeftSideVisible) {
    leftSideImage.style.visibility = "collapse";
    rightSideImage.style.visibility = "visible";
  } else {
    leftSideImage.style.visibility = "visible";
    rightSideImage.style.visibility = "collapse";
  }
  isLeftSideVisible = !isLeftSideVisible;
}
