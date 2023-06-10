import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";
// @ts-ignore
import ImageCompare from "image-compare-viewer";

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
  compareImage();
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

function compareImage() {
  const element = document.getElementById("image-compare");

  const options = {
    controlColor: "#FFFFFF",
    controlShadow: true,
    addCircle: false,
    addCircleBlur: true,

    // Label Defaults

    showLabels: false,
    labelOptions: {
      before: "Before",
      after: "After",
      onHover: false,
    },

    // Smoothing

    smoothing: false,
    smoothingAmount: 100,

    // Other options

    hoverStart: true,
    verticalMode: false,
    startingPoint: 50,
    fluidMode: false,
  };

  new ImageCompare(element, options).mount();
}
