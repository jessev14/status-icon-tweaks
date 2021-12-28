import { libWrapper } from '../lib/shim.js';


const moduleName = "status-icon-tweaks";


Hooks.once("init", () => {
    game.settings.register(moduleName, "shiftIcons", {
        name: "SIT.settings.shiftIcons.name",
        hint: "",
        scope: "world",
        config: true,
        type: String,
        choices: {
            disable: game.i18n.localize("SIT.settings.shiftIcons.disabled"),
            above: game.i18n.localize("SIT.settings.shiftIcons.above"),
            below: game.i18n.localize("SIT.settings.shiftIcons.below"),
            left: game.i18n.localize("SIT.settings.shiftIcons.left"),
            right: game.i18n.localize("SIT.settings.shiftIcons.right")
        },
        default: "disable",
        onChange: () => window.location.reload()
    });

    game.settings.register(moduleName, "offsetDistance", {
        name: "SIT.settings.offsetDistance.name",
        hint: "SIT.settings.offsetDistance.hint",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: -1,
            max: 1,
            step: 0.1
        },
        default: 0,
        onChange: () => window.location.reload()
    });
    
    game.settings.register(moduleName, "customGrid", {
        name: "SIT.settings.customGrid.name",
        hint: "SIT.settings.customGrid.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            6: game.i18n.localize("SIT.settings.customGrid.6"),
            5: game.i18n.localize("SIT.settings.customGrid.5"),
            4: game.i18n.localize("SIT.settings.customGrid.4"),
            3: game.i18n.localize("SIT.settings.customGrid.3"),
            customScale: game.i18n.localize("SIT.settings.customGrid.customScale")           
        },
        default: 5,
        onChange: () => window.location.reload()
    });

    game.settings.register(moduleName, "scaleIcons", {
        name: "SIT.settings.scaleIcons.name",
        hint: "SIT.settings.scaleIcons.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 1,
        range: {
            min: 0.1,
            max: 3,
            step: 0.1
        },
        onChange: () => window.location.reload()
    });

    libWrapper.register(moduleName, "Token.prototype.drawEffects", newDrawEffects, "WRAPPER");
});

async function newDrawEffects(wrapped) {
    // call original method to create status sprites and background
    await wrapped();

    if (!this.hud.effects?.children?.length) return;

    // destroy original background and replace with a copy at the same index
    this.hud.effects.children.find(c => c.pluginName === "smooth")?.destroy();

    // re-set effect sprite positions and draw new backgrounds with new sprite position
    const tokenWidth = this.data.width * canvas.grid.size;
    const tokenHeight = this.data.height * canvas.grid.size;
    const w = game.settings.get(moduleName, "customGrid") === "customScale" 
        ? game.settings.get(moduleName, "scaleIcons") * Math.round(canvas.dimensions.size / 2 / 5) * 2
        : tokenWidth / parseInt(game.settings.get(moduleName, "customGrid"));
    const newBG = this.hud.effects.addChildAt(new PIXI.Graphics(), 0).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);

    for (let i = 1; i < this.hud.effects.children.length; i++) {
        if (this.hud.effects.children[i].alpha === 0.8) continue;

        const offset = game.settings.get(moduleName, "offsetDistance") * -1 * w;
        let nr = Math.floor(tokenHeight / w);
        let x = Math.floor((i - 1) / nr) * w;
        let y = ((i - 1) % nr) * w;
        switch (game.settings.get(moduleName, "shiftIcons")) {
            case "above":
                nr = Math.floor(tokenWidth / w);
                x = ((i - 1) % nr) * w;
                y = Math.floor((i - 1) / nr) * w * -1 - w + offset;
                break;
            case "below":
                nr = Math.floor(tokenWidth / w);
                x = ((i - 1) % nr) * w;
                y = Math.floor((i - 1) / nr) * w + tokenHeight + offset;
                break;
            case "left":
                nr = Math.floor(tokenHeight / w);
                x = Math.floor((i - 1) / nr) * w * -1 - w + offset;
                y = ((i - 1) % nr) * w;
                break;
            case "right":
                nr = Math.floor(tokenHeight / w);
                x = Math.floor((i - 1) / nr) * w + tokenWidth + offset;
                y = ((i - 1) % nr) * w;
        }
        this.hud.effects.children[i].width = this.hud.effects.children[i].height = w;
        this.hud.effects.children[i].position.set(x, y);
        newBG.drawRoundedRect(x + 1, y + 1, w - 2, w - 2, 2);
    }
}
