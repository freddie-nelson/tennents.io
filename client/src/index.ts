import { API, Room } from "./api/colyseus";
import Game, { gameContainer } from "./game/game";
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

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value;

  if (typeof name !== "string" || name.length === 0 || name.length >= 20) {
    alert("Name must be a string with at least 1 character and less than 20 characters");
    return;
  }

  joinButton.innerText = "Joining...";

  await Textures.initTextures();
  SoundManager.initSounds();

  room = await api.joinOrCreate(name);

  joinForm.style.display = "none";
  gameContainer.style.display = "block";

  game = new Game(room);
  game.init();
  soundManager.playSound("backgroundMusic", true, 0.1);
});
