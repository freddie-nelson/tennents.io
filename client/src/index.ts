import { API } from "./api/colyseus";
import "./game/game";
import Game from "./game/game";

const api = new API();

const game = new Game();
game.init();
