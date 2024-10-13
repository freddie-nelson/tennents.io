import { request } from "http";

export function addBackToMainMenuButton() {
  const div = document.createElement("div");
  div.classList.add("back-to-main-menu");

  const button = document.createElement("button");
  button.classList.add("back-to-main-menu-btn");
  button.innerText = "Back to Main Menu";
  button.onclick = () => {
    window.location.href = "/";
  };
  div.appendChild(button);
  document.body.appendChild(div);
  requestAnimationFrame(() => {
    button.classList.add("show");
  });
}
