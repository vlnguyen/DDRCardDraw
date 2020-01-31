import * as classNames from "classnames";
import { TranslateContext } from "@denysvuika/preact-translate";
import "formdata-polyfill";
import { useContext, useState } from "preact/hooks";
import globalStyles from "../app.css";
import styles from "./song-pool-builder.css";
import { SongSearch } from "../song-search";
import { SongPick } from "./song-pick";
import { DrawStateContext } from "../draw-state";
import { Modal } from "../modal";
import { SongPoolSummary } from "./song-pool-summary";

export function SongPoolBuilder() {
    const { t } = useContext(TranslateContext);
    const { addPlayerPicksToSongPool } = useContext(DrawStateContext);

    const [collapsed, setCollapsed] = useState(true);
    const [pickedCharts, setPickedCharts] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [showSongPool, setShowSongPool] = useState(false);

    const handleChartPicked = (chart) => {
        if (!pickedCharts.some(c => c.name === chart.name && c.difficulty === chart.difficulty)) {
            setPickedCharts([...pickedCharts, chart]);
        }
    };

    const handleChartRemoved = (index) => {
        const newPickedCharts = [...pickedCharts];
        newPickedCharts.splice(index, 1);
        setPickedCharts(newPickedCharts);
    }

    const handleAddPicks = () => {
        addPlayerPicksToSongPool({
            playerName: playerName,
            charts: pickedCharts
        });
        setPickedCharts([]);
        setPlayerName("");
    };

    const handleViewSongPoolClick = () => {
        setShowSongPool(true);
    }

    return (
        <div>
            {showSongPool &&
                <Modal onClose={() => setShowSongPool(false)}>
                    <SongPoolSummary />
                </Modal>
            }
            <div className={collapsed ? " " + styles.collapsed : ""}>
                <section className={styles.columns}>
                    <div className={styles.column}>
                        <div className={styles.group}>
                            <SongSearch onSongSelect={handleChartPicked} />
                        </div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.group}>
                            Player name: <input
                                style={{ fontSize: "16px" }}
                                value={playerName}
                                onChange={e => setPlayerName(e.target.value)}
                            />
                        </div>
                        <div className={styles.group}>
                            {pickedCharts.map((chart, index) =>
                                <SongPick
                                    chart={chart}
                                    index={index}
                                    onRemove={handleChartRemoved}
                                />
                            )}
                        </div>
                        {pickedCharts.length > 0 &&
                            <div className={styles.group}>
                                <button onClick={handleAddPicks}>Add Picks</button>
                            </div>
                        }
                    </div>
                    <div className={styles.column}>
                        <div className={classNames(globalStyles.padded, styles.buttons)}>
                            <button onClick={() => setCollapsed(!collapsed)}>
                                {t(collapsed ? "songPoolBuilder.show" : "songPoolBuilder.hide")}
                            </button>
                            {" "}
                            <button onClick={() => handleViewSongPoolClick()}>
                                {t("songPoolBuilder.viewPool")}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
