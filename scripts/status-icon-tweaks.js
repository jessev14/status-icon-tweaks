const moduleID = 'status-icon-tweaks';


Hooks.once('init', () => {
    game.settings.register(moduleID, 'shiftIcons', {
        name: 'SIT.settings.shiftIcons.name',
        hint: '',
        scope: 'world',
        config: true,
        type: String,
        choices: {
            disable: game.i18n.localize('SIT.settings.shiftIcons.disabled'),
            above: game.i18n.localize('SIT.settings.shiftIcons.above'),
            below: game.i18n.localize('SIT.settings.shiftIcons.below'),
            left: game.i18n.localize('SIT.settings.shiftIcons.left'),
            right: game.i18n.localize('SIT.settings.shiftIcons.right')
        },
        default: 'disable',
        requiresReload: true
    });

    game.settings.register(moduleID, 'offsetDistance', {
        name: 'SIT.settings.offsetDistance.name',
        hint: 'SIT.settings.offsetDistance.hint',
        scope: 'world',
        config: true,
        type: Number,
        range: {
            min: -1,
            max: 1,
            step: 0.1
        },
        default: 0,
        requiresReload: true
    });

    game.settings.register(moduleID, 'customGrid', {
        name: 'SIT.settings.customGrid.name',
        hint: 'SIT.settings.customGrid.hint',
        scope: 'world',
        config: true,
        type: String,
        choices: {
            6: game.i18n.localize('SIT.settings.customGrid.6'),
            5: game.i18n.localize('SIT.settings.customGrid.5'),
            4: game.i18n.localize('SIT.settings.customGrid.4'),
            3: game.i18n.localize('SIT.settings.customGrid.3'),
            customScale: game.i18n.localize('SIT.settings.customGrid.customScale')
        },
        default: 5,
        requiresReload: true
    });

    game.settings.register(moduleID, 'scaleIcons', {
        name: 'SIT.settings.scaleIcons.name',
        hint: 'SIT.settings.scaleIcons.hint',
        scope: 'world',
        config: true,
        type: Number,
        default: 1,
        range: {
            min: 0.1,
            max: 3,
            step: 0.1
        },
        requiresReload: true
    });

    libWrapper.register(moduleID, 'Token.prototype._refreshEffects', newRefreshEffects, 'WRAPPER');
});


function newRefreshEffects(wrapped) {
    wrapped();

    const iconShift = game.settings.get(moduleID, 'shiftIcons');
    const effectsInCols = ['left', 'right'].includes(iconShift);
    const w = game.settings.get(moduleID, 'customGrid') === 'customScale'
        ? game.settings.get(moduleID, 'scaleIcons') * Math.round(canvas.dimensions.size / 2 / 5) * 2
        : (effectsInCols ? this.w : this.h) / parseInt(game.settings.get(moduleID, 'customGrid'));
    const offset = game.settings.get(moduleID, 'offsetDistance') * w;
    let rowsCols;
    if (typeof(game.settings.get(moduleID, 'customGrid')) === 'number') rowsCols = Math.floor((effectsInCols ? this.document.height : this.document.width) * game.settings.get(moduleID, 'customGrid'));
    else rowsCols = Math.floor((effectsInCols ? this.w : this.h) / w);
    const bg = this.effects.bg.clear().beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);

    let i = 0;
    for (const effect of this.effects.children) {
        if (effect === bg || effect === this.effects.overlay) continue;

        effect.width = effect.height = w;      
        if (effectsInCols) {
            if (iconShift === 'left') effect.x = Math.floor( i / rowsCols) * w * -1 - w - offset;
            else effect.x = effect.x = this.w + Math.floor(i / rowsCols) * w + offset;
            effect.y = (i % rowsCols) * w;
        } else {
            effect.x = (i % rowsCols) * w;
            if (iconShift === 'above') effect.y = Math.floor(i / rowsCols) * -w - w - offset;
            else effect.y = this.h + Math.floor(i / rowsCols) * w + offset;
        }

        bg.drawRoundedRect(effect.x + 1, effect.y + 1, w - 2, w - 2, 2);
        i++;
    }
}
