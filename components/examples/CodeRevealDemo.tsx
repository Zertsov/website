"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useState } from "react";
import styles from "./CodeRevealDemo.module.css";

const INITIAL_SPLIT = 55;
const MIN_SPLIT = 8;
const MAX_SPLIT = 92;

const codeLines = [
	"export function IssueComposer() {",
	"  return (",
	'    <section className="componentCard">',
	'      <header className="cardHeader">',
	'        <span className="statusPill">Draft</span>',
	'        <span className="mutedLabel">Issue composer</span>',
	"      </header>",
	"",
	'      <label className="field">',
	"        <span>Issue title</span>",
	'        <input readOnly value="Slider reveal distorts the UI" />',
	"      </label>",
	"",
	'      <div className="metaRow">',
	'        {["P2", "Design", "Frontend"].map((tag) => (',
	'          <span key={tag} className="metaChip">{tag}</span>',
	"        ))}",
	"      </div>",
	"",
	'      <button className="primaryAction">',
	"        Create issue",
	"      </button>",
	"    </section>",
	"  )",
	"}",
];

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

export function CodeRevealDemo() {
	const [split, setSplit] = useState(INITIAL_SPLIT);

	function updateSplit(clientX: number, element: HTMLDivElement) {
		const bounds = element.getBoundingClientRect();
		const ratio = clamp((clientX - bounds.left) / bounds.width, 0, 1);
		setSplit(clamp(ratio * 100, MIN_SPLIT, MAX_SPLIT));
	}

	function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
		event.currentTarget.setPointerCapture(event.pointerId);
		updateSplit(event.clientX, event.currentTarget);
	}

	function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
			return;
		}

		updateSplit(event.clientX, event.currentTarget);
	}

	function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			setSplit((current) => clamp(current - 2, MIN_SPLIT, MAX_SPLIT));
		}

		if (event.key === "ArrowRight") {
			event.preventDefault();
			setSplit((current) => clamp(current + 2, MIN_SPLIT, MAX_SPLIT));
		}
	}

	const style = {
		"--split": `${split}%`,
	} as CSSProperties;

	return (
		<section className={styles.frame}>
			<div
				className={styles.stage}
				onPointerCancel={handlePointerUp}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				style={style}
			>
				<div className={`${styles.pane} ${styles.livePane}`}>
					<div className={`${styles.ambientRing} ${styles.ambientRingA}`} />
					<div className={`${styles.ambientRing} ${styles.ambientRingB}`} />

					<div className={styles.componentCard}>
						<div className={styles.cardOrb} />
						<div className={styles.cardHeader}>
							<span className={styles.statusPill}>Draft</span>
							<span className={styles.mutedLabel}>Issue composer</span>
						</div>

						<div className={styles.componentBody}>
							<label className={styles.field}>
								<span>Issue title</span>
								<input
									readOnly
									type="text"
									value="Slider reveal distorts the UI"
								/>
							</label>

							<div className={styles.field}>
								<span>Queue</span>
								<div className={styles.selectField}>
									<span>Backlog</span>
									<span className={styles.caret}>⌄</span>
								</div>
							</div>

							<div className={styles.metaRow}>
								<span className={styles.metaChip}>P2</span>
								<span className={styles.metaChip}>Design</span>
								<span className={styles.metaChip}>Frontend</span>
							</div>

							<button className={styles.primaryAction} type="button">
								Create issue
							</button>
						</div>
					</div>
				</div>

				<div aria-hidden="true" className={`${styles.pane} ${styles.codePane}`}>
					<div className={styles.codePanel}>
						<div className={styles.codeHeader}>
							<span>IssueComposer.tsx</span>
							<span className={styles.codeDotRow}>
								<i />
								<i />
								<i />
							</span>
						</div>

						<pre className={styles.codeBlock}>
							<code>
								{codeLines.map((line, index) => (
									<span key={`${index}-${line}`} className={styles.codeLine}>
										{line || " "}
									</span>
								))}
							</code>
						</pre>
					</div>
				</div>

				<div aria-hidden="true" className={styles.splitEffect}>
					<div className={styles.splitCore} />
					<div className={styles.splitGlow} />
					<div className={styles.splitRipple} />
				</div>

				<button
					aria-label="Drag to reveal code"
					aria-orientation="horizontal"
					aria-valuemax={100}
					aria-valuemin={0}
					aria-valuenow={Math.round(split)}
					className={styles.dragHandle}
					onKeyDown={handleKeyDown}
					role="slider"
					type="button"
				>
					<span />
					<span />
					<span />
				</button>
			</div>
		</section>
	);
}
