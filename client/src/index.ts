import { API, Room } from "./api/colyseus";
import Game, { gameContainer } from "./game/game";
import { initChat } from "./game/messages";
import { SoundManager } from "./game/soundManager";
import Textures from "./game/Textures";

const api = new API();

let room: Room | null = null;
let game: Game | null = null;

const soundManager = SoundManager.getInstance();

// Preload background music
soundManager.loadSound("backgroundMusic", "/music/tennents.mp3");

const joinForm = document.getElementById("join-form") as HTMLFormElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const joinButton = joinForm.querySelector("button") as HTMLButtonElement;

const soundButton = document.querySelector(".sound-btn");
soundButton.addEventListener("click", () => {
  if (soundManager.getVolume() === 0) {
    soundManager.setVolume(0.5);
    soundManager.setVolumeKey("backgroundMusic", 0.1);
    soundButton.classList.remove("sound-btn-muted");
  } else {
    soundManager.setVolume(0);
    soundButton.classList.add("sound-btn-muted");
  }
});

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value;

  if (typeof name !== "string" || name.length === 0 || name.length >= 20) {
    alert("Name must be a string with at least 1 character and less than 20 characters");
    return;
  }

  joinButton.innerText = "Joining...";

  joinForm.style.display = "none";
  gameContainer.style.display = "block";

  await Textures.initTextures();
  SoundManager.initSounds();

  room = await api.joinOrCreate(name);

  game = new Game(room);
  game.init();
  soundManager.playSound("backgroundMusic", true, soundManager.getVolume() === 0 ? 0 : 0.1);

  initChat(game);
});
