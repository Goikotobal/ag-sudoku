import { useTranslations } from 'next-intl';

/**
 * Custom hook to access all Sudoku-related translations
 * Usage: const t = useSudokuTranslations();
 *        t.title, t.stats.time, t.modals.pause.title, etc.
 */
export function useSudokuTranslations() {
  const t = useTranslations('sudoku');

  return {
    // Basic info
    title: t('title'),
    subtitle: t('subtitle'),

    // Stats labels
    stats: {
      time: t('stats.time'),
      mistakes: t('stats.mistakes'),
      hints: t('stats.hints')
    },

    // Difficulty levels
    difficulties: {
      medium: t('difficulties.medium'),
      expert: t('difficulties.expert'),
      pro: t('difficulties.pro'),
      locked: t('difficulties.locked')
    },

    // Control buttons
    controls: {
      notes: t('controls.notes'),
      pause: t('controls.pause'),
      resume: t('controls.resume'),
      hint: t('controls.hint'),
      new: t('controls.new'),
      none: t('controls.none')
    },

    // Modals
    modals: {
      pause: {
        title: t('modals.pause.title'),
        time: t('modals.pause.time'),
        mistakes: t('modals.pause.mistakes'),
        difficulty: t('modals.pause.difficulty'),
        resumeBtn: t('modals.pause.resumeBtn'),
        restartBtn: t('modals.pause.restartBtn'),
        quitBtn: t('modals.pause.quitBtn'),
        confirmRestart: t('modals.pause.confirmRestart')
      },
      win: {
        title: t('modals.win.title'),
        message: t('modals.win.message'),
        time: t('modals.win.time'),
        mistakes: t('modals.win.mistakes'),
        tryHarderBtn: t('modals.win.tryHarderBtn'),
        playAgainBtn: t('modals.win.playAgainBtn'),
        quitBtn: t('modals.win.quitBtn')
      },
      gameOver: {
        title: t('modals.gameOver.title'),
        // For dynamic messages, use t.rich() or pass count as param
        getMessage: (count: number) => t('modals.gameOver.message', { count }),
        time: t('modals.gameOver.time'),
        difficulty: t('modals.gameOver.difficulty'),
        tryAgainBtn: t('modals.gameOver.tryAgainBtn'),
        tryEasierBtn: t('modals.gameOver.tryEasierBtn'),
        quitBtn: t('modals.gameOver.quitBtn')
      },
      hint: {
        title: t('modals.hint.title'),
        placeHere: t('modals.hint.placeHere'),
        getRowCol: (row: number, col: number) => t('modals.hint.rowCol', { row, col }),
        getTechnique: (technique: string) => t('modals.hint.technique', { technique }),
        logicTitle: t('modals.hint.logicTitle'),
        visualTitle: t('modals.hint.visualTitle'),
        getTargetLabel: (value: number) => t('modals.hint.targetLabel', { value }),
        conflictsLabel: t('modals.hint.conflictsLabel'),
        afterApplyTitle: t('modals.hint.afterApplyTitle'),
        getAfterApply1: (value: number) => t('modals.hint.afterApply1', { value }),
        afterApply2: t('modals.hint.afterApply2'),
        afterApply3: t('modals.hint.afterApply3'),
        applyBtn: t('modals.hint.applyBtn'),
        closeBtn: t('modals.hint.closeBtn'),
        // Logic explanation strings
        whereToPlace: t('modals.hint.whereToPlace'),
        row: t('modals.hint.row'),
        column: t('modals.hint.column'),
        box: t('modals.hint.box'),
        legend: {
          target: t('modals.hint.legend.target'),
          conflicts: t('modals.hint.legend.conflicts'),
          related: t('modals.hint.legend.related')
        },
        logic: {
          checkRow: t('modals.hint.logic.checkRow'),
          checkColumn: t('modals.hint.logic.checkColumn'),
          checkBox: t('modals.hint.logic.checkBox'),
          canAccept: t('modals.hint.logic.canAccept'),
          getNoExists: (number: number) => t('modals.hint.logic.noExists', { number }),
          getNoIn: (number: number) => t('modals.hint.logic.noIn', { number }),
          conclusion: t('modals.hint.logic.conclusion'),
          getMustBe: (row: number, col: number, number: number) => t('modals.hint.logic.mustBe', { row, col, number })
        },
        afterApplying: {
          title: t('modals.hint.afterApplying.title'),
          instruction: t('modals.hint.afterApplying.instruction')
        },
        techniques: {
          nakedSingle: t('modals.hint.techniques.nakedSingle'),
          hiddenSingle: t('modals.hint.techniques.hiddenSingle')
        }
      }
    },

    // Messages
    messages: {
      aiSolving: t('messages.aiSolving'),
      autoFinish: t('messages.autoFinish')
    },

    // Landing page
    landing: {
      description: t('landing.description'),
      playNow: t('landing.playNow'),
      backToHome: t('landing.backToHome')
    },

    // Difficulty info descriptions
    difficultyInfo: {
      medium: t('difficultyInfo.medium'),
      expert: t('difficultyInfo.expert'),
      pro: t('difficultyInfo.pro')
    },

    // Raw t function for custom usage
    t
  };
}

export type SudokuTranslations = ReturnType<typeof useSudokuTranslations>;
