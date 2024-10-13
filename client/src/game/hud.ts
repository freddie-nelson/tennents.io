import { State } from "pixi.js";
import Game from "./game";
import loseScreen from "./loseScreen";
import { generatePlacement } from "./generatePlacement";
import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import { HealingType } from "../../../server/src/rooms/schema/enums/HealingType";

enum RarityColours {
  COMMON = "#989FA4",
  UNCOMMON = "#409F03",
  RARE = "#0089DF",
  EPIC = "#A344E7",
  LEGENDARY = "#DD6D0D",
}

export default class HUD {
  // HTML Elements
  HUDElement: Element;
  HUDWeaponIcon: HTMLDivElement;
  HUDWeaponDisplay: HTMLDivElement;
  HUDWeaponName: HTMLDivElement;
  HUDHealingIcon: HTMLDivElement;
  HUDHealingDisplay: HTMLDivElement;
  HUDDrunkBar: HTMLDivElement;
  HUDDrunkBarNumber: HTMLDivElement;
  HUDPlacementNumber: HTMLDivElement;
  HUDPlacementSuffix: HTMLDivElement;

  // Variables
  drunkness: number;
  placement: number;
  game: Game;
  scale: number;
  loseShown: boolean;

  constructor(game: Game, scale = 1) {
    // Main HUD Div
    const HUDElement = document.getElementsByClassName("HUD")[0];

    // Top left element container
    const HUDLeftContainer = document.createElement("div");
    HUDLeftContainer.style.display = "flex";
    HUDLeftContainer.style.width = this.scaling(600, scale);
    HUDLeftContainer.style.position = "fixed";
    HUDLeftContainer.style.top = this.scaling(25, scale);
    HUDLeftContainer.style.left = this.scaling(25, scale);

    const HUDLeftFlex = document.createElement("div");
    HUDLeftFlex.style.display = "flex";
    HUDLeftFlex.style.flexDirection = "column";

    const HUDRightFlex = document.createElement("div");
    HUDRightFlex.style.display = "flex";
    HUDRightFlex.style.flexDirection = "column";
    HUDRightFlex.style.flexGrow = "3";

    const HUDWeaponDisplay = document.createElement("div");
    HUDWeaponDisplay.style.display = "flex";
    HUDWeaponDisplay.style.flexWrap = "wrap";
    HUDWeaponDisplay.style.alignContent = "center";
    HUDWeaponDisplay.style.justifyContent = "center";
    HUDWeaponDisplay.style.height = this.scaling(150, scale);
    HUDWeaponDisplay.style.width = this.scaling(150, scale);
    HUDWeaponDisplay.style.borderStyle = "solid";
    HUDWeaponDisplay.style.borderWidth = this.scaling(10, scale);
    HUDWeaponDisplay.style.borderColor = "#ffffff";

    const HUDWeaponIcon = document.createElement("div");
    HUDWeaponIcon.style.background = "url('/images/Attack/TENNENTS_KEG.svg')";
    HUDWeaponIcon.style.backgroundSize = this.scaling(120, scale) + " " + this.scaling(120, scale);
    HUDWeaponIcon.style.objectFit = "contain";
    HUDWeaponIcon.style.height = this.scaling(120, scale);
    HUDWeaponIcon.style.width = this.scaling(120, scale);
    HUDWeaponIcon.style.position = "relative";
    HUDWeaponIcon.style.zIndex = "1001";

    HUDWeaponDisplay.appendChild(HUDWeaponIcon);

    const HUDWeaponName = document.createElement("div");
    HUDWeaponName.textContent = "Tennents Lager";
    HUDWeaponName.style.fontSize = this.scaling(18, scale);
    HUDWeaponName.style.display = "flex";
    HUDWeaponName.style.flexWrap = "wrap";
    HUDWeaponName.style.alignContent = "center";
    HUDWeaponName.style.justifyContent = "center";
    HUDWeaponName.style.height = this.scaling(30, scale);
    HUDWeaponName.style.color = "#ffffff";
    HUDWeaponName.style.textAlign = "center";

    const HUDDrunkBar = document.createElement("div");
    HUDDrunkBar.style.display = "flex";
    HUDDrunkBar.style.alignItems = "center";
    HUDDrunkBar.style.height = this.scaling(80, scale);
    HUDDrunkBar.style.width = this.scaling(450, scale);
    HUDDrunkBar.style.borderTopStyle = "solid";
    HUDDrunkBar.style.borderBottomStyle = "solid";
    HUDDrunkBar.style.borderRightStyle = "solid";
    HUDDrunkBar.style.borderWidth = this.scaling(10, scale);
    HUDDrunkBar.style.borderColor = "#ffffff";
    HUDDrunkBar.style.background =
      "linear-gradient(90deg, #00000000, #00000000 50%, #00000000 65%, #ff000090 100%), linear-gradient(90deg, #F3AE1A, #F3AE1A " +
      this.drunknessInt() +
      "%, #ffffff " +
      this.drunknessInt() +
      "%, #ffffff " +
      this.drunknessInt(1) +
      "%, #00000000 " +
      this.drunknessInt(1) +
      "%, #00000000 100%)";

    const HUDDrunkBarNumberPadding = document.createElement("div");
    HUDDrunkBarNumberPadding.style.flexGrow = "4";

    const HUDDrunkBarNumber = document.createElement("div");
    HUDDrunkBarNumber.textContent = this.drunknessInt();
    HUDDrunkBarNumber.style.color = "#ffffff";
    HUDDrunkBarNumber.style.width = this.scaling(90, scale);
    HUDDrunkBarNumber.style.textAlign = "center";
    HUDDrunkBarNumber.style.fontSize = this.scaling(40, scale);

    const HUDHealingDisplay = document.createElement("div");
    HUDHealingDisplay.style.display = "flex";
    HUDHealingDisplay.style.flexWrap = "wrap";
    HUDHealingDisplay.style.alignContent = "center";
    HUDHealingDisplay.style.justifyContent = "center";
    HUDHealingDisplay.style.height = this.scaling(70, scale);
    HUDHealingDisplay.style.width = this.scaling(70, scale);
    HUDHealingDisplay.style.borderBottomStyle = "solid";
    HUDHealingDisplay.style.borderRightStyle = "solid";
    HUDHealingDisplay.style.borderWidth = this.scaling(5, scale);
    HUDHealingDisplay.style.borderColor = "#ffffff";

    const HUDHealingIcon = document.createElement("div");
    HUDHealingIcon.style.background = "url('/images/Attack/TENNENTS_KEG.svg')";
    HUDHealingIcon.style.backgroundSize = this.scaling(55, scale) + " " + this.scaling(55, scale);
    HUDHealingIcon.style.height = this.scaling(55, scale);
    HUDHealingIcon.style.width = this.scaling(55, scale);
    HUDHealingIcon.style.position = "relative";
    HUDHealingIcon.style.zIndex = "1001";

    HUDHealingDisplay.appendChild(HUDHealingIcon);

    HUDDrunkBar.appendChild(HUDDrunkBarNumberPadding);
    HUDDrunkBar.appendChild(HUDDrunkBarNumber);

    HUDLeftFlex.appendChild(HUDWeaponDisplay);
    HUDLeftFlex.appendChild(HUDWeaponName);
    HUDRightFlex.appendChild(HUDDrunkBar);
    HUDRightFlex.appendChild(HUDHealingDisplay);

    HUDLeftContainer.appendChild(HUDLeftFlex);
    HUDLeftContainer.appendChild(HUDRightFlex);

    HUDElement.appendChild(HUDLeftContainer);

    // Right Hand Side HUD Element (Current Position)
    const HUDRightContainer = document.createElement("div");
    HUDRightContainer.style.display = "flex";
    HUDRightContainer.style.width = this.scaling(150, scale);
    HUDRightContainer.style.position = "fixed";
    HUDRightContainer.style.bottom = this.scaling(25, scale);
    HUDRightContainer.style.right = this.scaling(50, scale);

    const HUDPlacementNumber = document.createElement("div");
    HUDPlacementNumber.style.width = this.scaling(110, scale);
    HUDPlacementNumber.style.height = this.scaling(200, scale);
    HUDPlacementNumber.style.fontSize = this.scaling(200, scale);
    HUDPlacementNumber.style.color = "#ffffff";
    HUDPlacementNumber.textContent = "N/A";

    const HUDPlacementSuffix = document.createElement("div");
    HUDPlacementSuffix.style.position = "relative";
    HUDPlacementSuffix.style.width = this.scaling(40, scale);
    HUDPlacementSuffix.style.height = this.scaling(200, scale);
    HUDPlacementSuffix.style.fontSize = this.scaling(50, scale);
    HUDPlacementSuffix.style.top = this.scaling(25, scale);
    HUDPlacementSuffix.style.color = "#ffffff";
    HUDPlacementSuffix.textContent = "th";

    HUDRightContainer.appendChild(HUDPlacementNumber);
    HUDRightContainer.appendChild(HUDPlacementSuffix);

    HUDElement.appendChild(HUDRightContainer);

    // Mocking Starting Values
    this.game = game;
    this.drunkness = 0;
    this.placement = 0;
    this.scale = scale;

    this.HUDElement = HUDElement;
    this.HUDWeaponIcon = HUDWeaponIcon;
    this.HUDWeaponDisplay = HUDWeaponDisplay;
    this.HUDWeaponName = HUDWeaponName;
    this.HUDHealingIcon = HUDHealingIcon;
    this.HUDHealingDisplay = HUDHealingDisplay;
    this.HUDDrunkBar = HUDDrunkBar;
    this.HUDDrunkBarNumber = HUDDrunkBarNumber;
    this.HUDPlacementNumber = HUDPlacementNumber;
    this.HUDPlacementSuffix = HUDPlacementSuffix;

    this.setWeaponRarity(RarityColours.COMMON);
    this.setHealingRarity(RarityColours.COMMON);
    this.updateGame();
  }

  private scaling(px: number, scale: number) {
    return String(Math.ceil(px * scale)) + "px";
  }

  private drunknessInt(offset = 0) {
    return String(Math.ceil(this.drunkness) + offset);
  }

  private drunknessString(offset = 0) {
    return String(this.drunkness + offset);
  }

  public setDrunkness(x: number) {
    this.drunkness = x;
  }

  public changeDrunkness(x: number) {
    this.drunkness = this.drunkness + x;
  }

  public setWeaponRarity(x: RarityColours) {
    this.HUDWeaponDisplay.style.background = x + "40";
  }

  public setHealingRarity(x: RarityColours) {
    this.HUDHealingDisplay.style.background = x + "40";
  }

  public setWeaponIcon(x: string) {
    this.HUDWeaponIcon.style.background =
      this.scaling(120, this.scale) +
      " / " +
      this.scaling(120, this.scale) +
      " url('/images/Attack/" +
      x +
      ".svg')";
  }

  public setHealingIcon(x: string) {
    this.HUDHealingIcon.style.background =
      this.scaling(55, this.scale) +
      " / " +
      this.scaling(55, this.scale) +
      " url('/images/Heal/" +
      x +
      ".svg')";
  }

  public updateDrunknessDisplay() {
    this.HUDDrunkBarNumber.textContent = this.drunknessInt();
    this.HUDDrunkBar.style.background =
      "linear-gradient(90deg, #00000000, #00000000 50%, #00000000 65%, #ff000090 100%), linear-gradient(90deg, #F3AE1A, #F3AE1A " +
      this.drunknessString() +
      "%, #ffffff " +
      this.drunknessString() +
      "%, #ffffff " +
      this.drunknessString(1) +
      "%, #00000000 " +
      this.drunknessString(1) +
      "%, #00000000 100%)";
  }

  public updatePlacementDisplay() {
    const formattedPlacement = generatePlacement(this.placement);
    this.HUDPlacementNumber.textContent = formattedPlacement.slice(0, -2);
    this.HUDPlacementSuffix.textContent = formattedPlacement.slice(-2);
  }

  public updateWeapon(weapon: WeaponType) {
    switch (weapon) {
      case WeaponType.TENNENTS_LIGHT:
        this.setWeaponIcon("TENNENTS_LIGHT");
        this.setWeaponRarity(RarityColours.COMMON);
        break;
      case WeaponType.TENNENTS_PINT:
        this.setWeaponIcon("TENNENTS_PINT");
        this.setWeaponRarity(RarityColours.UNCOMMON);
        break;
      case WeaponType.TENNENTS_ORIGINAL:
        this.setWeaponIcon("TENNENTS_ORIGINAL");
        this.setWeaponRarity(RarityColours.RARE);
        break;
      case WeaponType.TENNENTS_SUPER:
        this.setWeaponIcon("TENNENTS_SUPER");
        this.setWeaponRarity(RarityColours.EPIC);
        break;
      case WeaponType.TENNENTS_KEG:
        this.setWeaponIcon("TENNENTS_KEG");
        this.setWeaponRarity(RarityColours.LEGENDARY);
        break;
      default:
        this.setWeaponIcon("TENNENTS_LIGHT");
        this.setWeaponRarity(RarityColours.COMMON);
        break;
    }
  }

  public updateHeals(heal: HealingType) {
    switch (heal) {
      case HealingType.TENNENTS_ZERO:
        this.setHealingIcon("TENNENTS_ZERO");
        this.setHealingRarity(RarityColours.COMMON);
        break;
      case HealingType.WATER:
        this.setHealingIcon("WATER");
        this.setHealingRarity(RarityColours.UNCOMMON);
        break;
      case HealingType.COFFEE:
        this.setHealingIcon("COFFEE");
        this.setHealingRarity(RarityColours.RARE);
        break;
      case HealingType.ORANGE_JUICE:
        this.setHealingIcon("ORANGE_JUICE");
        this.setHealingRarity(RarityColours.EPIC);
        break;
      case HealingType.DONER_KEBAB:
        this.setHealingIcon("DONER_KEBAB");
        this.setHealingRarity(RarityColours.LEGENDARY);
        break;
      default:
        this.setHealingIcon("TENNENTS_ZERO");
        this.setHealingRarity(RarityColours.COMMON);
        break;
    }
  }

  public setWeaponText(x: string) {
    this.HUDWeaponName.textContent = x;
  }

  private removeHUD() {
    this.HUDElement.innerHTML = "";
  }

  private updateGame() {
    this.game.onStageChange((state) => {
      this.drunkness = state.you?.drunkiness ?? 0;
      this.placement = state.room.state.players.size;

      const weapon = state.you?.weapon ?? null;
      const heal = state.you?.healing ?? null;

      this.updateDrunknessDisplay();
      this.updatePlacementDisplay();

      if (weapon != null) {
        this.updateWeapon(weapon);
      }

      if (heal != null) {
        this.updateHeals(heal);
      }

      if (!this.loseShown && (!state.you || this.drunkness >= 100)) {
        this.removeHUD();
        loseScreen(this.placement + 1);
        this.loseShown = true;
      }
    });
  }
}
