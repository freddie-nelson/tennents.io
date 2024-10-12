import { State } from "pixi.js";
import Game from "./game";
import loseScreen from "./loseScreen";

enum RarityColours {
    COMMON = "#989FA4",
    UNCOMMON = "#409F03",
    RARE = "#0089DF",
    EPIC = "#A344E7",
    LEGENDARY = "#DD6D0D"
}

export default class HUD {

    // HTML Elements
    HUDElement: Element;
    HUDItemIcon: HTMLDivElement;
    HUDItemDisplay: HTMLDivElement;
    HUDItemName: HTMLDivElement;
    HUDDrunkBar: HTMLDivElement;
    HUDDrunkBarNumber: HTMLDivElement;



    // Variables
    drunkness: number;
    game: Game;

    constructor(game:Game, scale=1) {

        // Main HUD Div
        const HUDElement = document.getElementsByClassName("HUD")[0];
        
        // Top left element container
        const HUDLeftContainer = document.createElement("div")
        HUDLeftContainer.style.display = "flex";
        HUDLeftContainer.style.width = this.scaling(600, scale);
        HUDLeftContainer.style.position = "fixed";
        HUDLeftContainer.style.top = this.scaling(25, scale);
        HUDLeftContainer.style.left = this.scaling(25, scale);

        const HUDLeftFlex = document.createElement("div");
        HUDLeftFlex.style.display = "flex";
        HUDLeftFlex.style.flexDirection = "column";

        const HUDRightFlex = document.createElement("div")
        HUDRightFlex.style.display = "flex";
        HUDRightFlex.style.flexDirection = "column";
        HUDRightFlex.style.flexGrow = "3"

        const HUDItemDisplay = document.createElement("div")
        HUDItemDisplay.style.display = "flex"
        HUDItemDisplay.style.flexWrap = "wrap"
        HUDItemDisplay.style.alignContent = "center"
        HUDItemDisplay.style.justifyContent = "center"
        HUDItemDisplay.style.height = this.scaling(150, scale)
        HUDItemDisplay.style.width = this.scaling(150, scale)
        HUDItemDisplay.style.borderStyle = "solid"
        HUDItemDisplay.style.borderWidth = this.scaling(10, scale)
        HUDItemDisplay.style.borderColor = "#ffffff"

        const HUDItemIcon = document.createElement("div")
        HUDItemIcon.style.background = "background: url('/images/Attack/TENNENTS_KEG.svg')"
        HUDItemIcon.style.height = this.scaling(120, scale)
        HUDItemIcon.style.width = this.scaling(120, scale)
        HUDItemIcon.style.position = "relative"
        HUDItemIcon.style.zIndex = "1001"

        HUDItemDisplay.appendChild(HUDItemIcon)

        const HUDItemName = document.createElement("div")
        HUDItemName.textContent = "Tennents Lager"
        HUDItemName.style.fontSize = this.scaling(18, scale)
        HUDItemName.style.display = "flex"
        HUDItemName.style.flexWrap = "wrap"
        HUDItemName.style.alignContent = "center"
        HUDItemName.style.justifyContent = "center"
        HUDItemName.style.height = this.scaling(30, scale)
        HUDItemName.style.color = "#ffffff"
        HUDItemName.style.textAlign = "center"
        
        const HUDDrunkBar = document.createElement("div")
        HUDDrunkBar.style.display = "flex"
        HUDDrunkBar.style.alignItems = "center"
        HUDDrunkBar.style.height = this.scaling(80, scale)
        HUDDrunkBar.style.width = this.scaling(450, scale)
        HUDDrunkBar.style.borderStyle = "solid"
        HUDDrunkBar.style.borderWidth = this.scaling(10, scale)
        HUDDrunkBar.style.borderColor = "#ffffff"
        HUDDrunkBar.style.background = "linear-gradient(90deg, #00000000, #00000000 50%, #00000000 65%, #ff000090 100%), linear-gradient(90deg, #F3AE1A, #F3AE1A " + this.drunknessInt() + "%, #ffffff " + this.drunknessInt() + "%, #ffffff " + this.drunknessInt(1) + "%, #00000000 " + this.drunknessInt(1) + "%, #00000000 100%)"

        const HUDDrunkBarNumberPadding = document.createElement("div")
        HUDDrunkBarNumberPadding.style.flexGrow = "4"

        const HUDDrunkBarNumber = document.createElement("div")
        HUDDrunkBarNumber.textContent = this.drunknessInt()
        HUDDrunkBarNumber.style.color = "#ffffff"
        HUDDrunkBarNumber.style.width = this.scaling(90, scale)
        HUDDrunkBarNumber.style.textAlign = "center"
        HUDDrunkBarNumber.style.fontSize = this.scaling(40, scale)

        HUDDrunkBar.appendChild(HUDDrunkBarNumberPadding)
        HUDDrunkBar.appendChild(HUDDrunkBarNumber)

        HUDLeftFlex.appendChild(HUDItemDisplay)
        HUDLeftFlex.appendChild(HUDItemName)
        HUDRightFlex.appendChild(HUDDrunkBar)

        HUDLeftContainer.appendChild(HUDLeftFlex)
        HUDLeftContainer.appendChild(HUDRightFlex)

        HUDElement.appendChild(HUDLeftContainer)

        this.setRarity(RarityColours.COMMON)


        // Right Hand Side HUD Element (Current Position)



        // Mocking Starting Values
        this.game = game
        this.drunkness = 50
        
        this.HUDElement = HUDElement
        this.HUDItemIcon = HUDItemIcon
        this.HUDItemDisplay = HUDItemDisplay
        this.HUDItemName = HUDItemName
        this.HUDDrunkBar = HUDDrunkBar
        this.HUDDrunkBarNumber = HUDDrunkBarNumber

        this.update()
    }

    private update() {
        const updateInterval = setInterval(() => {
            this.updateDrunknessDisplay()
            if (this.drunkness >= 100) {
                clearInterval(updateInterval)
                this.removeHUD()
                loseScreen(4)
            }
        }, 50);
    }

    private scaling(px:number, scale:number) {
        return String(Math.ceil(px * scale)) + "px"
    }

    private drunknessInt(offset=0) {
        return String(Math.ceil(this.drunkness) + offset)
    }

    private drunknessString(offset=0) {
        return String(this.drunkness + offset)
    }

    public setDrunkness(x:number) {
        this.drunkness = x;
    }

    public changeDrunkness(x:number) {
        this.drunkness = this.drunkness + x;
    }

    public setRarity(x:RarityColours) {
        this.HUDItemDisplay.style.background = x + "40"
    }

    public updateDrunknessDisplay() {
        this.HUDDrunkBarNumber.textContent = this.drunknessInt()
        this.HUDDrunkBar.style.background = "linear-gradient(90deg, #00000000, #00000000 50%, #00000000 65%, #ff000090 100%), linear-gradient(90deg, #F3AE1A, #F3AE1A " + this.drunknessString() + "%, #ffffff " + this.drunknessString() + "%, #ffffff " + this.drunknessString(1) + "%, #00000000 " + this.drunknessString(1) + "%, #00000000 100%)"
    }

    public setItemText(x:string) {
        this.HUDItemName.textContent = x
    }

    private removeHUD() {
        this.HUDElement.innerHTML = ""
    }

    private updateGame() {
        this.game.onStageChange((state) => {
            this.drunkness = state.you?.drunkiness ?? 0
            this.updateDrunknessDisplay()
        })
    }

}
