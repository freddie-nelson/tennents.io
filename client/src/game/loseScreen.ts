import { generatePlacement } from "./generatePlacement";
import { SoundManager } from "./soundManager";

export default function loseScreen(placement: number) {
  document.body.style.background = "#00000000";

  const source = document.createElement("source");
  source.src = "videos/loseScreen.webm";
  source.type = "video/webm";

  const video = document.createElement("video");
  video.classList.add("fullscreen");
  video.classList.add("video-style");
  video.id = "lose";
  video.width = 1000;
  video.height = 1000;
  video.addEventListener(
    "play",
    function () {
      fallingText();
    },
    false
  );

  video?.appendChild(source);
  video.muted = SoundManager.getInstance().getVolume() === 0;

  video.load();
  video.play();

  SoundManager.getInstance().stopSound("backgroundMusic");

  const overlay = document.getElementsByClassName("overlay")[0];
  overlay.classList.add("fullscreen");
  overlay?.appendChild(video);

  function getVideoTime() {
    return video.currentTime;
  }

  function fallingText() {
    const fallingInterval = setInterval(() => {
      if (getVideoTime() >= 10.1) {
        const fallingText = document.createElement("div");
        fallingText.classList.add("fallingText");
        fallingText.textContent = "You placed " + generatePlacement(placement);

        const fallingTextContainer = document.createElement("div");
        fallingTextContainer.classList.add("fullscreen");
        fallingTextContainer.classList.add("flexCenterParent");
        fallingTextContainer.classList.add("fallingTextAnimation");
        fallingTextContainer.appendChild(fallingText);

        overlay.appendChild(fallingTextContainer);
        clearInterval(fallingInterval);
      }
    }, 50);
  }
}
