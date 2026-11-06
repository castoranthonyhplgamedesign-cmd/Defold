import { FOLDER_CLUE_TEXT, FOLDER_TAB_CLUE_TEXT } from './constants';
import type { FolderId } from './iteration';
import { createLocalization } from './utils/localization';

export const SUPPORTED_LOCALES = [
  'en',
  'de',
  'fr',
  'es',
  'pt',
  'ru',
  'zh-Hans',
  'zh-Hant',
  'ko',
  'ja',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

type TranslationPack = {
  appTitle: string;
  gameTitle: string;
  dragInstruction: string;
  logoLabel: string;
  clue1Name: string;
  clue2Name: string;
  clue3Name: string;
  answerName: string;
  folderProgress: (current: number, total: number) => string;
  totalProgress: (current: number, total: number) => string;
  movesLabel: (remaining: number) => string;
  timerLabel: (seconds: number) => string;
  lockedLabel: string;
  winTitle: string;
  winBody: string;
  timeUpTitle: string;
  timeUpBody: string;
  bootErrorText: (message: string) => string;
  localeDebugLabel: (locale: string) => string;
};

const LOCALE_ALIASES: Record<string, SupportedLocale> = {
  'en-US': 'en',
  'en-GB': 'en',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'es-ES': 'es',
  'es-MX': 'es',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'ru-RU': 'ru',
  zh: 'zh-Hans',
  'zh-CN': 'zh-Hans',
  'zh-SG': 'zh-Hans',
  'zh-Hans-CN': 'zh-Hans',
  'zh-Hans-SG': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'zh-HK': 'zh-Hant',
  'zh-MO': 'zh-Hant',
  'zh-Hant-TW': 'zh-Hant',
  'zh-Hant-HK': 'zh-Hant',
  'ko-KR': 'ko',
  'ja-JP': 'ja',
};

const TRANSLATIONS = {
  en: {
    appTitle: 'Find the Unique Flag',
    gameTitle: 'Guess the Country',
    dragInstruction: 'DRAG AND DROP',
    logoLabel: 'Category Sort',
    clue1Name: 'Not in Europe',
    clue2Name: 'Has a beach',
    clue3Name: 'Flag has red',
    answerName: 'Answer',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} sorted`,
    movesLabel: remaining => `${remaining} moves`,
    timerLabel: seconds => `${seconds}s`,
    lockedLabel: 'Locked',
    winTitle: 'Unique Flag found!',
    winBody: 'You cleared every clue and found the one-of-a-kind flag.',
    timeUpTitle: 'Nice sorting!',
    timeUpBody: 'Keep narrowing flags in the full game.',
    bootErrorText: message => `Playable error: ${message}`,
    localeDebugLabel: locale => `LANG ${locale}`,
  },
  de: {
    appTitle: 'Finde die einzigartige Flagge',
    gameTitle: 'Errate das Land',
    dragInstruction: 'ZIEHEN UND ABLEGEN',
    logoLabel: 'Kategorie sortieren',
    clue1Name: 'Nicht in Europa',
    clue2Name: 'Hat eine Küste',
    clue3Name: 'Flagge hat Rot',
    answerName: 'Antwort',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} sortiert`,
    movesLabel: remaining => `${remaining} Züge`,
    timerLabel: seconds => `${seconds}s`,
    lockedLabel: 'Gesperrt',
    winTitle: 'Einzigartige Flagge gefunden!',
    winBody: 'Du hast alle Hinweise gelöst und die einzigartige Flagge gefunden.',
    timeUpTitle: 'Gut sortiert!',
    timeUpBody: 'Grenze die Flaggen im vollständigen Spiel weiter ein.',
    bootErrorText: message => `Playable-Fehler: ${message}`,
    localeDebugLabel: locale => `SPRACHE ${locale}`,
  },
  fr: {
    appTitle: 'Trouve le drapeau unique',
    gameTitle: 'Devine le pays',
    dragInstruction: 'GLISSE ET DÉPOSE',
    logoLabel: 'Tri par catégorie',
    clue1Name: "Pas en Europe",
    clue2Name: 'A un littoral',
    clue3Name: 'Drapeau avec rouge',
    answerName: 'Réponse',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} triés`,
    movesLabel: remaining => `${remaining} coups`,
    timerLabel: seconds => `${seconds}s`,
    lockedLabel: 'Verrouillé',
    winTitle: 'Drapeau unique trouvé !',
    winBody: 'Tu as résolu chaque indice et trouvé le drapeau unique.',
    timeUpTitle: 'Beau tri !',
    timeUpBody: 'Continue à réduire les drapeaux dans le jeu complet.',
    bootErrorText: message => `Erreur du playable : ${message}`,
    localeDebugLabel: locale => `LANGUE ${locale}`,
  },
  es: {
    appTitle: 'Encuentra la bandera única',
    gameTitle: 'Adivina el país',
    dragInstruction: 'ARRASTRA Y SUELTA',
    logoLabel: 'Ordenar categorías',
    clue1Name: 'No está en Europa',
    clue2Name: 'Tiene costa',
    clue3Name: 'La bandera tiene rojo',
    answerName: 'Respuesta',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} ordenados`,
    movesLabel: remaining => `${remaining} movs.`,
    timerLabel: seconds => `${seconds}s`,
    lockedLabel: 'Bloqueado',
    winTitle: '¡Bandera única encontrada!',
    winBody: 'Resolviste todas las pistas y encontraste la bandera única.',
    timeUpTitle: '¡Buen orden!',
    timeUpBody: 'Sigue reduciendo las banderas en el juego completo.',
    bootErrorText: message => `Error del playable: ${message}`,
    localeDebugLabel: locale => `IDIOMA ${locale}`,
  },
  pt: {
    appTitle: 'Encontre a bandeira única',
    gameTitle: 'Adivinhe o país',
    dragInstruction: 'ARRASTE E SOLTE',
    logoLabel: 'Classificar categorias',
    clue1Name: 'Não está na Europa',
    clue2Name: 'Tem litoral',
    clue3Name: 'A bandeira tem vermelho',
    answerName: 'Resposta',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} classificados`,
    movesLabel: remaining => `${remaining} jogadas`,
    timerLabel: seconds => `${seconds}s`,
    lockedLabel: 'Bloqueado',
    winTitle: 'Bandeira única encontrada!',
    winBody: 'Você resolveu todas as pistas e encontrou a bandeira única.',
    timeUpTitle: 'Boa classificação!',
    timeUpBody: 'Continue reduzindo as bandeiras no jogo completo.',
    bootErrorText: message => `Erro do playable: ${message}`,
    localeDebugLabel: locale => `IDIOMA ${locale}`,
  },
  ru: {
    appTitle: 'Найди уникальный флаг',
    gameTitle: 'Угадай страну',
    dragInstruction: 'ПЕРЕТАЩИ И ОТПУСТИ',
    logoLabel: 'Сортировка категорий',
    clue1Name: 'Не в Европе',
    clue2Name: 'Есть побережье',
    clue3Name: 'На флаге есть красный',
    answerName: 'Ответ',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} отсортировано`,
    movesLabel: remaining => `${remaining} ходов`,
    timerLabel: seconds => `${seconds}с`,
    lockedLabel: 'Заблокировано',
    winTitle: 'Уникальный флаг найден!',
    winBody: 'Ты решил все подсказки и нашел уникальный флаг.',
    timeUpTitle: 'Отличная сортировка!',
    timeUpBody: 'Продолжай сужать выбор флагов в полной игре.',
    bootErrorText: message => `Ошибка playable: ${message}`,
    localeDebugLabel: locale => `ЯЗЫК ${locale}`,
  },
  'zh-Hans': {
    appTitle: '找出独特旗帜',
    gameTitle: '猜国家',
    dragInstruction: '拖放',
    logoLabel: '分类排序',
    clue1Name: '不在欧洲',
    clue2Name: '有海岸线',
    clue3Name: '旗帜有红色',
    answerName: '答案',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `已分类 ${current}/${total}`,
    movesLabel: remaining => `${remaining} 步`,
    timerLabel: seconds => `${seconds}秒`,
    lockedLabel: '已锁定',
    winTitle: '找到独特旗帜！',
    winBody: '你解开了所有线索，找到了独一无二的旗帜。',
    timeUpTitle: '分类不错！',
    timeUpBody: '在完整版中继续缩小旗帜范围。',
    bootErrorText: message => `试玩错误：${message}`,
    localeDebugLabel: locale => `语言 ${locale}`,
  },
  'zh-Hant': {
    appTitle: '找出獨特旗幟',
    gameTitle: '猜國家',
    dragInstruction: '拖放',
    logoLabel: '分類排序',
    clue1Name: '不在歐洲',
    clue2Name: '有海岸線',
    clue3Name: '旗幟有紅色',
    answerName: '答案',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `已分類 ${current}/${total}`,
    movesLabel: remaining => `${remaining} 步`,
    timerLabel: seconds => `${seconds}秒`,
    lockedLabel: '已鎖定',
    winTitle: '找到獨特旗幟！',
    winBody: '你解開了所有線索，找到了獨一無二的旗幟。',
    timeUpTitle: '分類不錯！',
    timeUpBody: '在完整版中繼續縮小旗幟範圍。',
    bootErrorText: message => `試玩錯誤：${message}`,
    localeDebugLabel: locale => `語言 ${locale}`,
  },
  ko: {
    appTitle: '고유한 깃발 찾기',
    gameTitle: '나라 맞히기',
    dragInstruction: '드래그 앤 드롭',
    logoLabel: '카테고리 정렬',
    clue1Name: '유럽 아님',
    clue2Name: '해안 있음',
    clue3Name: '깃발에 빨강 있음',
    answerName: '정답',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} 정렬`,
    movesLabel: remaining => `${remaining}회 이동`,
    timerLabel: seconds => `${seconds}초`,
    lockedLabel: '잠김',
    winTitle: '고유한 깃발 발견!',
    winBody: '모든 단서를 풀고 고유한 깃발을 찾았습니다.',
    timeUpTitle: '잘 정렬했어요!',
    timeUpBody: '전체 게임에서 계속 깃발 범위를 좁혀보세요.',
    bootErrorText: message => `플레이어블 오류: ${message}`,
    localeDebugLabel: locale => `언어 ${locale}`,
  },
  ja: {
    appTitle: 'ユニークな旗を見つけよう',
    gameTitle: '国を当てよう',
    dragInstruction: 'ドラッグして入れる',
    logoLabel: 'カテゴリ分類',
    clue1Name: 'ヨーロッパ以外',
    clue2Name: '海岸線がある',
    clue3Name: '旗に赤がある',
    answerName: '答え',
    folderProgress: (current, total) => `${current}/${total}`,
    totalProgress: (current, total) => `${current}/${total} 分類`,
    movesLabel: remaining => `あと${remaining}手`,
    timerLabel: seconds => `${seconds}秒`,
    lockedLabel: 'ロック中',
    winTitle: 'ユニークな旗を発見！',
    winBody: 'すべての手がかりを解いて、ユニークな旗を見つけました。',
    timeUpTitle: 'いい分類！',
    timeUpBody: '完全版でさらに旗を絞り込もう。',
    bootErrorText: message => `Playable エラー: ${message}`,
    localeDebugLabel: locale => `言語 ${locale}`,
  },
} satisfies Record<SupportedLocale, TranslationPack>;

const COUNTRY_DISCOVERED_HEADLINES = {
  en: 'Country discovered!',
  de: 'Land entdeckt!',
  fr: 'Pays découvert !',
  es: '¡País descubierto!',
  pt: 'País descoberto!',
  ru: 'Страна открыта!',
  'zh-Hans': '发现国家！',
  'zh-Hant': '發現國家！',
  ko: '국가 발견!',
  ja: '国を発見！',
} as const satisfies Record<SupportedLocale, string>;

const DOWNLOAD_LABELS = {
  en: 'DOWNLOAD',
  de: 'HERUNTERLADEN',
  fr: 'TELECHARGER',
  es: 'DESCARGAR',
  pt: 'BAIXAR',
  ru: 'СКАЧАТЬ',
  'zh-Hans': '下载',
  'zh-Hant': '下載',
  ko: '다운로드',
  ja: 'ダウンロード',
} as const satisfies Record<SupportedLocale, string>;

export const localization = createLocalization<SupportedLocale, TranslationPack>({
  supportedLocales: SUPPORTED_LOCALES,
  defaultLocale: 'en',
  translations: TRANSLATIONS,
  localeAliases: LOCALE_ALIASES,
});

const FOLDER_NAME_KEYS = {
  notInEurope: 'clue1Name',
  hasCross: 'clue2Name',
  threeColorBands: 'clue3Name',
  answer: 'answerName',
} as const satisfies Record<FolderId, keyof TranslationPack>;

export function getGameTitle(): string {
  return localization.format('gameTitle');
}

export function getDragInstruction(): string {
  return localization.format('dragInstruction');
}

export function getLogoLabel(): string {
  return localization.format('logoLabel');
}

export function getFolderName(folderId: FolderId): string {
  return localization.format(FOLDER_NAME_KEYS[folderId]);
}

export function getFolderClue(folderId: FolderId): string {
  return FOLDER_CLUE_TEXT[localization.currentLocale][folderId]
    ?? FOLDER_CLUE_TEXT[localization.defaultLocale][folderId];
}

export function getFolderTabClue(folderId: FolderId): string {
  return FOLDER_TAB_CLUE_TEXT[localization.currentLocale]?.[folderId]
    ?? FOLDER_CLUE_TEXT[localization.currentLocale][folderId]
    ?? FOLDER_TAB_CLUE_TEXT[localization.defaultLocale]?.[folderId]
    ?? FOLDER_CLUE_TEXT[localization.defaultLocale][folderId];
}

export function getFolderProgress(current: number, total: number): string {
  return localization.format('folderProgress', current, total);
}

export function getTotalProgress(current: number, total: number): string {
  return localization.format('totalProgress', current, total);
}

export function getMovesLabel(remaining: number): string {
  return localization.format('movesLabel', remaining);
}

export function getTimerLabel(seconds: number): string {
  return localization.format('timerLabel', seconds);
}

export function getLockedLabel(): string {
  return localization.format('lockedLabel');
}

export function getWinTitle(): string {
  return localization.format('winTitle');
}

export function getWinBody(): string {
  return localization.format('winBody');
}

export function getTimeUpTitle(): string {
  return localization.format('timeUpTitle');
}

export function getTimeUpBody(): string {
  return localization.format('timeUpBody');
}

export function getCountryDiscoveredHeadline(): string {
  return COUNTRY_DISCOVERED_HEADLINES[localization.currentLocale]
    ?? COUNTRY_DISCOVERED_HEADLINES[localization.defaultLocale];
}

export function getDownloadLabel(): string {
  return DOWNLOAD_LABELS[localization.currentLocale]
    ?? DOWNLOAD_LABELS[localization.defaultLocale];
}

export function getBootErrorText(message: string): string {
  return localization.format('bootErrorText', message);
}

export function getLocaleDebugLabel(locale: SupportedLocale): string {
  return localization.format('localeDebugLabel', locale);
}


function withGameFont(fallback: string): string {
  return `"FlagGameFont", ${fallback}`;
}

function withFolderFont(fallback: string): string {
  return `"FlagFolderFont", ${fallback}`;
}

export function getLocalizedFontFamily(): string {
  switch (localization.currentLocale) {
    case 'ru':
      return withGameFont('Arial, "Segoe UI", sans-serif');
    case 'zh-Hans':
      return withGameFont('"Noto Sans SC", "Microsoft YaHei", "PingFang SC", Arial, sans-serif');
    case 'zh-Hant':
      return withGameFont('"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", Arial, sans-serif');
    case 'ko':
      return withGameFont('"Noto Sans KR", "Malgun Gothic", Arial, sans-serif');
    case 'ja':
      return withGameFont('"Noto Sans JP", "Hiragino Sans", "Yu Gothic", Arial, sans-serif');
    default:
      return withGameFont('Arial, "Helvetica Neue", sans-serif');
  }
}

export function getFolderFontFamily(): string {
  switch (localization.currentLocale) {
    case 'ru':
      return withFolderFont('Arial, "Segoe UI", sans-serif');
    case 'zh-Hans':
      return withFolderFont('"Noto Sans SC", "Microsoft YaHei", "PingFang SC", Arial, sans-serif');
    case 'zh-Hant':
      return withFolderFont('"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", Arial, sans-serif');
    case 'ko':
      return withFolderFont('"Noto Sans KR", "Malgun Gothic", Arial, sans-serif');
    case 'ja':
      return withFolderFont('"Noto Sans JP", "Hiragino Sans", "Yu Gothic", Arial, sans-serif');
    default:
      return withFolderFont('Arial, "Helvetica Neue", sans-serif');
  }
}
