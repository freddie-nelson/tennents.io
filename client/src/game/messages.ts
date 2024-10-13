import { MessageType } from "../../../server/src/rooms/schema/enums/MessageType";
import Game from "./game";

export const messagesContainer = document.querySelector(".messages");
export const messageForm = document.getElementById("message-form");
export const messageInput = messageForm.querySelector("input");

export function initChat(game: Game) {
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = messageInput.value;
    if (message) {
      game.room.send(MessageType.SEND_MESSAGE, message);
      messageInput.value = "";
    }
  });

  game.room.state.messages.onAdd((message) => {
    const messageElement = document.createElement("p");
    const name = message.split(":")[0] + ":";
    const m = message.split(":").slice(1).join(":");

    const nameSpan = document.createElement("span");
    nameSpan.innerText = name;

    const messageNode = document.createTextNode(m);

    messageElement.appendChild(nameSpan);
    messageElement.appendChild(messageNode);

    messagesContainer.appendChild(messageElement);
  });
}
