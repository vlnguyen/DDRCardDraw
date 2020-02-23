import classNames from "classnames";
import styles from "./song-pick.css";
import { DrawnChart } from "../models/Drawing";
import { useState } from "preact/hooks";
import { AbbrDifficulty } from "../game-data-utils";
import { useDifficultyColor } from "../hooks/useDifficultyColor";
import { Modal } from "../modal";
import { SongSearch } from "../song-search";

interface Props {
    chart: DrawnChart | null;
    index: number;
    onChartSelected: (chart: DrawnChart, index: number) => void;
}

export function SongPick(props: Props) {
    const { chart, index, onChartSelected } = props;

    const [showSongSearch, setShowSongSearch] = useState(false);

    let name, nameTranslation, level, jacket, jacketBg = {};
    if (chart) {
        ({ name, nameTranslation, level, jacket } = chart);
        if (jacket) {
            jacketBg = {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("jackets/${jacket}")`
            };
        }
    }
    else {
        name = nameTranslation = `Select Song ${index + 1}`
        jacketBg = {
            backgroundColor: "black"
        }
    }

    return (
        <div className={classNames(styles.chart)} onClick={() => setShowSongSearch(true)}>
            <div className={styles.cardCenter} style={jacketBg}>
                <div className={styles.name} title={nameTranslation}>
                    {nameTranslation || name}
                </div>
            </div>
            {chart && <div className={styles.cardFooter} style={{ backgroundColor: useDifficultyColor(chart.difficultyClass) }}>
                <div className={styles.difficulty}>
                    <AbbrDifficulty diffClass={chart.difficultyClass} /> {level}
                </div>
            </div>}
            {showSongSearch &&
                <Modal onClose={() => setShowSongSearch(false)}>
                    <SongSearch
                        autofocus
                        onSongSelect={chart => onChartSelected(chart, index)}
                        onCancel={() => setShowSongSearch(false)}
                    />
                </Modal>
            }
        </div>
    );
}
