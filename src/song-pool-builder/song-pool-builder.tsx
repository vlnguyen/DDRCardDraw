import { useContext, useRef, useState, StateUpdater } from "preact/hooks";
import styles from "./song-pool-builder.css";
import { DrawStateContext } from "../draw-state";
import { ConfigStateContext } from "../config-state";
import { DrawnChart } from "../models/Drawing";
import { SongPick } from "./song-pick";

function preventDefault(e: Event) {
    e.preventDefault();
}

export function SongPoolBuilder(this: any) {
    const { gameData } = useContext(DrawStateContext);
    if (!gameData) {
        return null;
    }

    const form = useRef<HTMLFormElement>();
    const configState = useContext(ConfigStateContext);
    const { update: updateState, chartCount } = configState;

    const [playerName, setPlayerName] = useState("");
    const [poolsPicks, setPoolsPicks] = useState<(DrawnChart | null)[]>([null, null, null, null, null]);
    const [bracketPicks, setBracketPicks] = useState<(DrawnChart | null)[]>([null, null, null, null, null, null, null]);


    const handleSongSelected = (chart: DrawnChart, index: number, picksGroup: "pools" | "bracket") => {
        let songPicks: (DrawnChart | null)[];
        let setSongPicks: StateUpdater<(DrawnChart | null)[]>;

        if (picksGroup === "pools") {
            songPicks = [...poolsPicks];
            setSongPicks = setPoolsPicks;
        }
        else if (picksGroup === "bracket") {
            songPicks = [...bracketPicks];
            setSongPicks = setBracketPicks;
        }

        songPicks!.splice(index, 1, chart);
        setSongPicks!(songPicks!);
    };

    return (
        <form
            ref={form}
            className={styles.form}
            onSubmit={preventDefault}
        >
            <section className={styles.columns}>
                <div className={styles.column}>
                    <div className={styles.group}>
                        <strong>Player Name</strong>
                        <input
                            type="text"
                            value={playerName}
                            placeholder="(e-Amuse Name)"
                            onInput={e => setPlayerName(e.currentTarget.value)}
                        />
                    </div>
                    <div className={styles.group}>
                        <strong>Player Picks - Pools</strong>
                        {poolsPicks.map((chart, index) =>
                            <SongPick
                                chart={chart}
                                index={index}
                                onChartSelected={(chart, index) => {
                                    handleSongSelected(chart, index, "pools");
                                }}
                            />)}
                    </div>
                    <div className={styles.group}>
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
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.group}>
                        <strong>Song Pick Rules - Pools</strong>
                        <ul>
                            <li>Pick 5 songs.</li>
                            <li>Follow the difficulty requirements.</li>
                        </ul>
                    </div>
                    <div className={styles.group}>
                        <strong>Song Pick Rules - Double Elimination</strong>
                        <ul>
                            <li>Pick 7 songs.</li>
                            <li>Follow the difficulty requirements.</li>
                        </ul>
                    </div>
                    <div className={styles.group}>
                        <strong>Download Song Picks</strong>
                        <button>Download</button>
                    </div>
                </div>
            </section>
        </form>
    );
}
