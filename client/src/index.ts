import { API } from "./api/colyseus";
import Game from "./game/Game";

const api = new API();

const game = new Game();
game.init();
