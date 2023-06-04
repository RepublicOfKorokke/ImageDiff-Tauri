import { invoke } from "@tauri-apps/api/tauri";
import { ask, open } from '@tauri-apps/api/dialog';

let ogaMsg = document.querySelector("#oga-msg");

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#oga-button")
    ?.addEventListener("click", () => showDialog("Title", "msg"));
  document
    .querySelector("#open-button")
    ?.addEventListener("click", () => showOpenDialog());
});

async function showDialog(title: string, msg: string): Promise<Boolean> {
    const yes = await ask(msg, title);
    if (yes) {
        invoke("print_log", {text: "yes"});
    } else {
        invoke("print_log", {text: "no"});
    }
    return yes
}

async function showOpenDialog() {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Image',
        extensions: ['png', 'jpg']
      }]
    });
    if (Array.isArray(selected)) {
        invoke("print_log", {text: `Multiple items ${selected}`}); // only invoked on multiple flag set false
    } else if (selected === null) {
        invoke("print_log", {text: "Canceled"});
    } else {
        invoke("print_log", {text: `Single item ${selected}`}); // only invoked on multiple flag set false
    }
}

window.addEventListener('keydown', function(event) {
   if (ogaMsg != null) {
       ogaMsg.textContent = event.key;
   }
});
