import { useContext, useState, StateUpdater } from "preact/hooks";
import styles from "./song-pool-builder.css";
import { DrawStateContext } from "../draw-state";
import { DrawnChart } from "../models/Drawing";
import { SongPick } from "./song-pick";
import { SongPicksValidation, validationKeys, validationKeyConsts } from "../models/SongPicks";

export function SongPoolBuilder(this: any) {
    const { gameData } = useContext(DrawStateContext);
    if (!gameData) {
        return null;
    }

    const [playerName, setPlayerName] = useState("");
    const [poolsPicks, setPoolsPicks] = useState<(DrawnChart | null)[]>([null, null, null, null, null]);
    const [bracketPicks, setBracketPicks] = useState<(DrawnChart | null)[]>([null, null, null, null, null, null, null]);
    const [songValidation, setSongValidation] = useState<SongPicksValidation>({
        pools: {
            [validationKeyConsts.pools.songCount]: false,
            [validationKeyConsts.common.difficultyClass]: false,
            [validationKeyConsts.pools.range]: false,
            [validationKeyConsts.pools.thirteens]: false,
            [validationKeyConsts.pools.fourteens]: false,
            [validationKeyConsts.pools.fifteens]: false,
            [validationKeyConsts.pools.sixteens]: false,
            [validationKeyConsts.common.duplicates]: true,
            [validationKeyConsts.common.unlocks]: true,
            [validationKeyConsts.common.tempUnlocks]: true,
            [validationKeyConsts.common.extraStages]: true,
            [validationKeyConsts.common.goldExclusives]: true,
        },
        bracket: {
            [validationKeyConsts.bracket.songCount]: false,
            [validationKeyConsts.bracket.difficultyClass]: false,
            [validationKeyConsts.bracket.range]: false,
            [validationKeyConsts.bracket.fifteens]: true,
            [validationKeyConsts.bracket.sixteens]: false,
            [validationKeyConsts.bracket.seventeens]: false,
            [validationKeyConsts.bracket.eighteens]: false,
            [validationKeyConsts.bracket.ninteens]: true,
            [validationKeyConsts.common.duplicates]: true,
            [validationKeyConsts.common.tempUnlocks]: true,
            [validationKeyConsts.common.goldExclusives]: true,
            [validationKeyConsts.common.extraStages]: true,
        }
    });

    const handleSongSelected = (chart: DrawnChart, index: number, picksGroup: "pools" | "bracket") => {
        if (picksGroup === "pools") {
            const newPoolsPicks = [...poolsPicks];
            newPoolsPicks.splice(index, 1, chart);
            setPoolsPicks(newPoolsPicks);
            setPicksValidationObject(newPoolsPicks, bracketPicks);
        }
        else if (picksGroup === "bracket") {
            const newBracketPicks = [...bracketPicks];
            newBracketPicks.splice(index, 1, chart);
            setBracketPicks(newBracketPicks);
            setPicksValidationObject(poolsPicks, newBracketPicks);
        }
    };

    const setPicksValidationObject = (picksPools: (DrawnChart | null)[], picksBracket: (DrawnChart | null)[]) => {
        const vObj = { ...songValidation };
        console.log(picksPools, picksBracket);

        /** Validate levels in the pools picks range only from 13-16. */
        let poolsLevelRange = true;
        let poolsDifficultyClass = true;
        let poolsContainsDuplicates = false;
        const poolsLevels = new Map<number, number>([
            [13, 0],
            [14, 0],
            [15, 0],
            [16, 0]
        ]);
        picksPools.forEach((c, cIndex) => {
            if (c) {
                // If the chart is in the wrong level range
                if (c.level < 13 || c.level > 16) {
                    // set the level range as invalid
                    poolsLevelRange = false;
                }
                // Otherwise if the chart is in the right level range
                else {
                    // add 1 to the count of songs at that level
                    poolsLevels.set(c.level, poolsLevels.get(c.level)! + 1)
                }

                // If the chart is not an ESP or CSP chart
                if (c.difficultyClass !== 'challenge' && c.difficultyClass !== 'expert') {
                    // set the difficulty classes as invalid
                    poolsDifficultyClass = false;
                }

                // Use the name/artist to detect duplicates.
                // Submitting the same song but different charts is okay.
                if (picksPools
                    .filter((p, pIndex) => p !== null && pIndex !== cIndex)
                    .some(poolsChart => poolsChart &&
                        c.difficultyClass === poolsChart.difficultyClass &&
                        c.name === poolsChart.name &&
                        c.artist === poolsChart.artist)) {
                    // Mark that a duplicate has been detected
                    poolsContainsDuplicates = true;
                }
            }
        })

        /** Validate levels in the bracket picks range only from 15-19. */
        let bracketLevelRange = true;
        let bracketDifficultyClass = true;
        let bracketContainsDuplicates = false;
        const bracketLevels = new Map<number, number>([
            [15, 0],
            [16, 0],
            [17, 0],
            [18, 0],
            [19, 0]
        ]);
        picksBracket.forEach((c, cIndex) => {
            if (c) {
                // If the chart is in the wrong level range
                if (c.level < 15 || c.level > 19) {
                    // set the level range as invalid
                    bracketLevelRange = false;
                }
                // Otherwise if the chart is in the right level range
                else {
                    // add 1 to the count of songs at that level
                    bracketLevels.set(c.level, bracketLevels.get(c.level)! + 1)
                }

                // If the chart is not an ESP or CSP chart
                if (c.difficultyClass !== 'challenge' && c.difficultyClass !== 'expert') {
                    // set the difficulty classes as invalid
                    bracketDifficultyClass = false;
                }

                // Use the name/artist to detect duplicates.
                // Submitting the same song but different charts is okay.
                if (bracketPicks
                    .filter((p, pIndex) => p !== null && pIndex !== cIndex)
                    .some(bracketChart => bracketChart &&
                        c.difficultyClass === bracketChart.difficultyClass &&
                        c.name === bracketChart.name &&
                        c.artist === bracketChart.artist)) {
                    // Mark that a duplicate has been detected
                    bracketContainsDuplicates = true;
                }
            }
        })

        /* Pools - Pick 5 songs */
        vObj.pools[validationKeyConsts.pools.songCount] = picksPools.filter(c => c !== null).length === 5;
        vObj.pools[validationKeyConsts.common.difficultyClass] = poolsDifficultyClass;
        vObj.pools[validationKeyConsts.pools.range] = poolsLevelRange;
        vObj.pools[validationKeyConsts.pools.thirteens] = poolsLevels.get(13)! >= 1 && poolsLevels.get(13)! <= 2;
        vObj.pools[validationKeyConsts.pools.fourteens] = poolsLevels.get(14)! >= 1 && poolsLevels.get(14)! <= 2;
        vObj.pools[validationKeyConsts.pools.fifteens] = poolsLevels.get(15)! >= 1 && poolsLevels.get(15)! <= 2;
        vObj.pools[validationKeyConsts.pools.sixteens] = poolsLevels.get(16)! >= 1 && poolsLevels.get(16)! <= 2;
        vObj.pools[validationKeyConsts.common.duplicates] = !poolsContainsDuplicates;
        vObj.pools[validationKeyConsts.common.unlocks] = !picksPools.filter(c => c !== null).some(c => chartContainsFlag(c!, "unlock"));
        vObj.pools[validationKeyConsts.common.tempUnlocks] = !picksPools.filter(c => c !== null).some(c => chartContainsFlag(c!, "tempUnlock"));
        vObj.pools[validationKeyConsts.common.extraStages] = !picksPools.filter(c => c !== null).some(c => chartContainsFlag(c!, "extraExclusive"));
        vObj.pools[validationKeyConsts.common.goldExclusives] = !picksPools.filter(c => c !== null).some(c => chartContainsFlag(c!, "goldExclusive"));

        /* Bracket - Pick 7 songs */
        vObj.bracket[validationKeyConsts.bracket.songCount] = picksBracket.filter(c => c !== null).length === 7;
        vObj.bracket[validationKeyConsts.common.difficultyClass] = bracketDifficultyClass;
        vObj.bracket[validationKeyConsts.bracket.range] = bracketLevelRange;
        vObj.bracket[validationKeyConsts.bracket.fifteens] = bracketLevels.get(15)! >= 0 && bracketLevels.get(15)! <= 1;
        vObj.bracket[validationKeyConsts.bracket.sixteens] = bracketLevels.get(16)! >= 2 && bracketLevels.get(16)! <= 4;
        vObj.bracket[validationKeyConsts.bracket.seventeens] = bracketLevels.get(17)! >= 1 && bracketLevels.get(17)! <= 2;
        vObj.bracket[validationKeyConsts.bracket.eighteens] = bracketLevels.get(18)! >= 1 && bracketLevels.get(18)! <= 2;
        vObj.bracket[validationKeyConsts.bracket.ninteens] = bracketLevels.get(19)! >= 0 && bracketLevels.get(19)! <= 1;
        vObj.bracket[validationKeyConsts.common.duplicates] = !bracketContainsDuplicates;
        vObj.bracket[validationKeyConsts.common.tempUnlocks] = !picksBracket.filter(c => c !== null).some(c => chartContainsFlag(c!, "tempUnlock"));
        vObj.bracket[validationKeyConsts.common.extraStages] = !picksBracket.filter(c => c !== null).some(c => chartContainsFlag(c!, "extraExclusive"));
        vObj.bracket[validationKeyConsts.common.goldExclusives] = !picksBracket.filter(c => c !== null).some(c => chartContainsFlag(c!, "goldExclusive"));

        setSongValidation(vObj);
    };

    const chartContainsFlag = (drawnChart: DrawnChart, flag: string): boolean => {
        const song = gameData.songs.filter(song => song.name === drawnChart.name && song.artist === drawnChart.artist)![0];
        if (song.flags && song.flags.some(songFlag => songFlag === flag)) {
            return true;
        }
        const songChart = song.charts.filter(c => c.diffClass === drawnChart.difficultyClass)![0];
        if (songChart.flags && songChart.flags.some(songFlag => songFlag === flag)) {
            return true;
        }
        return false;
    };

    const songPicksAreValid = () => {
        console.log(songValidation);
        const poolsValid = Object.keys(songValidation.pools).every(poolsKey => songValidation.pools[poolsKey]);
        const bracketValid = Object.keys(songValidation.bracket).every(bracketKey => songValidation.bracket[bracketKey]);
        console.log(poolsValid, bracketValid);
        return poolsValid && bracketValid;
    }

    const renderPlayerNameInput = () => {
        return (
            <>
                <strong>Player Name</strong><br />
                <input
                    type="text"
                    value={playerName}
                    placeholder="(e-Amuse Name)"
                    onInput={e => setPlayerName(e.currentTarget.value)}
                />
            </>
        );
    };

    const renderPoolsPicksInput = () => {
        return (
            <>
                <strong>Player Picks - Pools</strong>
                {poolsPicks.map((chart, index) =>
                    <SongPick
                        chart={chart}
                        index={index}
                        onChartSelected={(chart, index) => {
                            handleSongSelected(chart, index, "pools");
                        }}
                    />
                )}
            </>
        );
    }

    const renderPoolsPicksRules = () => {
        return (
            <>
                <strong>Song Pick Rules - Pools</strong>
                {validationKeys.pools.map(validationKey =>
                    <div>
                        {songValidation.pools[validationKey]
                            ? <span style={{ color: "green" }}>&#10003;</span>
                            : <span style={{ color: "red" }}>&#10005;</span>
                        } {validationKey}
                    </div>
                )}
            </>
        );
    }

    const renderBracketPicksInput = () => {
        return (
            <>
                <strong>Player Picks - Double Elimination</strong>
                {bracketPicks.map((chart, index) =>
                    <SongPick
                        chart={chart}
                        index={index}
                        onChartSelected={(chart, index) => {
                            handleSongSelected(chart, index, "bracket");
                        }}
                    />
                )}
            </>
        );
    };

    const renderBracketPicksRules = () => {
        return (
            <>
                <strong>Song Pick Rules - Double Elimination</strong>
                {validationKeys.bracket.map(validationKey =>
                    <div>
                        {songValidation.bracket[validationKey]
                            ? <span style={{ color: "green" }}>&#10003;</span>
                            : <span style={{ color: "red" }}>&#10005;</span>
                        } {validationKey}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className={styles.songPoolBuilder}>
            <div className={styles.box}>
                {renderPoolsPicksInput()}
            </div>
            <div className={styles.box}>
                {renderPoolsPicksRules()}
            </div>
            <div className={styles.box}>
                {renderBracketPicksInput()}
            </div>
            <div className={styles.box}>
                {renderBracketPicksRules()}<br /><br />
                {renderPlayerNameInput()}<br /><br />
                <button disabled={!songPicksAreValid()}>Download</button>
            </div>
        </div>
    );
}
