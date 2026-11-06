import mapBg from '../Assets/MapBG.webp';
import characterBg from '../Assets/CharBG.webp';
import clueBg from '../Assets/ClueBG.webp';
import dropCircle from '../Assets/Dashed-Circle.webp';
import error from '../Assets/Error.webp';
import logo from '../Assets/Logo.webp';
import tutorialHand from '../Assets/hand-egypt.webp';
import Aisha from '../Assets/Characters/Aisha.webp';
import Maya from '../Assets/Characters/Maya.webp';
import Ahmose from '../Assets/Characters/Ahmose.webp';
import Nefertiti from '../Assets/Characters/Nefertiti.webp';
import Merneptah from '../Assets/Characters/Merneptah.webp';
import Khasekhemwy from '../Assets/Characters/Khasekhemwy.webp';

export const bundledAssets: Record<string, string> = {
  'map-bg': mapBg,
  'character-bg': characterBg,
  'clue-bg': clueBg,
  'drop-circle': dropCircle,
  error,
  logo,
  'tutorial-hand': tutorialHand,
  Aisha,
  Maya,
  Ahmose,
  Nefertiti,
  Merneptah,
  Khasekhemwy,
  bgm: '/Assets/Audio/BGM.mp3',
  'pick-drop-character': '/Assets/Audio/PickDropCharacter.mp3',
  return: '/Assets/Audio/Return.mp3',
  correct: '/Assets/Audio/Correct.mp3',
  wrong: '/Assets/Audio/Wrong.mp3',
  'red-strike': '/Assets/Audio/RedStrike.mp3',
  endcard: '/Assets/Audio/EndCard.mp3',
  'ahmose-sfx': '/Assets/Audio/AhmoseSFX.mp3',
  'maya-sfx': '/Assets/Audio/MayaSFX.mp3',
  'merneptah-sfx': '/Assets/Audio/MerneptahSFX.mp3',
  'nefertiti-sfx': '/Assets/Audio/NefertitiSFX.mp3',
};
