import mapBg from '../Assets/MapBG.webp';
import characterBg from '../Assets/CharBG.webp';
import clueBg from '../Assets/ClueBG.webp';
import dropCircle from '../Assets/Dashed-Circle.webp';
import error from '../Assets/Error.webp';
import logo from '../Assets/Logo.webp';
import tutorialHand from '../Assets/hand-egypt.webp';
import Tia from '../Assets/Characters/Tia.webp';
import Nebet from '../Assets/Characters/Nebet.webp';
import Nakht from '../Assets/Characters/Nakht.webp';
import Merit from '../Assets/Characters/Merit.webp';
import Huy from '../Assets/Characters/Huy.webp';
import Senen from '../Assets/Characters/Senen.webp';

export const bundledAssets: Record<string, string> = {
  'map-bg': mapBg,
  'character-bg': characterBg,
  'clue-bg': clueBg,
  'drop-circle': dropCircle,
  error,
  logo,
  'tutorial-hand': tutorialHand,
  Tia,
  Nebet,
  Nakht,
  Merit,
  Huy,
  Senen,
  bgm: '/Assets/Audio/BGM.mp3',
  'pick-drop-character': '/Assets/Audio/PickDropCharacter.mp3',
  return: '/Assets/Audio/Return.mp3',
  correct: '/Assets/Audio/Correct.mp3',
  wrong: '/Assets/Audio/Wrong.mp3',
  'red-strike': '/Assets/Audio/RedStrike.mp3',
  endcard: '/Assets/Audio/EndCard.mp3',
  'nakht-sfx': '/Assets/Audio/NakhtSFX.mp3',
  'nebet-sfx': '/Assets/Audio/NebetSFX.mp3',
  'huy-sfx': '/Assets/Audio/HuySFX.mp3',
  'merit-sfx': '/Assets/Audio/MeritSFX.mp3',
};
