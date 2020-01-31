import styles from "./song-pool-summary.css";
import { useContext, useState } from "preact/hooks";
import { SongPick } from "./song-pick";
import { DrawStateContext } from "../draw-state";

export function SongPoolSummary(props) {
    const { playerPicks: stateSongPool } = useContext(DrawStateContext);
    const [songPool, setSongPool] = useState(
        stateSongPool.map(playerPicks => {
            return { ...playerPicks, active: false };
        })
    );

    const togglePicksActive = (playerPicks, index) => {
        const newPlayerPicks = { ...playerPicks, active: !playerPicks.active };
        const newSongPool = [...songPool];
        newSongPool.splice(index, 1, newPlayerPicks);
        setSongPool(newSongPool);
    }

    return (
        <div className={styles.songPoolBuilder}>
            {songPool.map((playerPicks, index) =>
                <div>
                    <button type="button"
                        className={styles.collapsible}
                        onClick={() => { togglePicksActive(playerPicks, index) }}
                    >
                        {playerPicks.playerName}
                    </button>
                    <div className={playerPicks.active ? styles.showContent : styles.hideContent}>
                        {playerPicks.charts.map((chart, index) =>
                            <SongPick chart={chart} index={index} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
