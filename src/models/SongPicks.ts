import { DrawnChart } from "./Drawing";

export interface SongPicks {
    playerName: string;
    poolsActive: boolean;
    poolsPicks: (DrawnChart | null)[];
    bracketActive: boolean;
    bracketPicks: (DrawnChart | null)[]
}

export const validationKeyConsts = {
    common: {
        difficultyClass: "Expert/Challenge charts only",
        duplicates: "No duplicate charts",
        unlocks: "No unlockable songs or charts",
        tempUnlocks: "No temporarily unlockable songs or charts from events.",
        extraStages: "No Extra Stage / Extra Exclusive songs or charts",
        goldExclusives: "No gold cab exclusives"
    },
    pools: {
        songCount: "Pick 5 songs",
        range: "Difficulties range 13-16 only (inclusive)",
        thirteens: "13s: Require 1, Limit 2",
        fourteens: "14s: Require 1, Limit 2",
        fifteens: "15s: Require 1, Limit 2",
        sixteens: "16s: Require 1, Limit 2"
    },
    bracket: {
        songCount: "Pick 7 songs",
        difficultyClass: "Expert/Challenge charts only",
        range: "Difficulties range 15-19 only (inclusive)",
        fifteens: "15s: Limit 1",
        sixteens: "16s: Require 2, Limit 4",
        seventeens: "17s: Require 1, Limit 2",
        eighteens: "18s: Require 1, Limit 2",
        ninteens: "19s: Limit 1"
    }
};

/**
 * Validation conditions for picking songs for pools and double elimination.
 * Any keys that are added here should also be added to the validation object
 * defaults in the song pool builder state initialization.
 */
export const validationKeys = {
    pools: [
        validationKeyConsts.pools.songCount,
        validationKeyConsts.common.difficultyClass,
        validationKeyConsts.pools.range,
        validationKeyConsts.pools.thirteens,
        validationKeyConsts.pools.fourteens,
        validationKeyConsts.pools.fifteens,
        validationKeyConsts.pools.sixteens,
        validationKeyConsts.common.duplicates,
        validationKeyConsts.common.unlocks,
        validationKeyConsts.common.tempUnlocks,
        validationKeyConsts.common.extraStages,
        validationKeyConsts.common.goldExclusives
    ],
    bracket: [
        validationKeyConsts.bracket.songCount,
        validationKeyConsts.bracket.difficultyClass,
        validationKeyConsts.bracket.range,
        validationKeyConsts.bracket.fifteens,
        validationKeyConsts.bracket.sixteens,
        validationKeyConsts.bracket.seventeens,
        validationKeyConsts.bracket.eighteens,
        validationKeyConsts.bracket.ninteens,
        validationKeyConsts.common.duplicates,
        validationKeyConsts.common.tempUnlocks,
        validationKeyConsts.common.goldExclusives,
        validationKeyConsts.common.extraStages
    ]
}

export interface SongPicksValidation {
    pools: {
        [k: string]: boolean;
    },
    bracket: {
        [k: string]: boolean;
    }
}