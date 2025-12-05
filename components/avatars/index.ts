// Base64 encoded pixel art PNGs (16x16)
const avatarKnightBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGFJREFUOE9jZGBg+M+AB/wuKgr/YdABKaAAnY+IiAhTAnVgNC+g8B9J/gME/wGkf0Fa/p/hvxCr/1vS//8T8//fM/wfYhT/D1D/H4T6P5D8Hx//HwA7ChAhxV5hAgAAAABJRU5ErkJggg==';
const avatarWizardBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG9JREFUOE9jZGBg+M+AB/yviYn5T4ENaEDjG5hZWP7PaALUgeL/gAz/gXQ/IO3/D1D/PzDy/1/S/5/h/wGq/1tS/f/3DP8HKP//h/g/wPz/D9T/HwT1fyD5Pz7+Pxv/f2T8//8AOCYQIRUDdRgAAAAASUVORK5CYII=';
const avatarRogueBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGFJREFUOE9jZGBg+M+AB/x/YWEh/sdABbSA4T8g/g9I/gME/wGkf0Fa/p/h/wGm/1vS/18S8/9/Zvg/wPz/D1D/HwT1fyD5Pz7+Pxv/f2T8//8A/z8QIX2uKlgAAAAASUVORK5CYII=';

export const avatars: { [key: string]: string } = {
    knight: `data:image/png;base64,${avatarKnightBase64}`,
    wizard: `data:image/png;base64,${avatarWizardBase64}`,
    rogue: `data:image/png;base64,${avatarRogueBase64}`,
};

export const avatarIds = Object.keys(avatars);
