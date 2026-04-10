import type { Metadata } from "next";
import { CodeRevealDemo } from "@/components/examples/CodeRevealDemo";
import { SimpleLayout } from "@/components/SimpleLayout";

export const metadata: Metadata = {
	title: "Component Code Reveal",
	description:
		"An interactive example that reveals the code behind a UI component as you drag across it.",
};

export default function CodeRevealPage() {
	return (
		<SimpleLayout
			title="Component / code reveal"
			intro="A small interaction demo: drag the divider to compare the rendered UI against the source that builds it."
		>
			<div className="space-y-6">
				<div className="rounded-3xl border border-zinc-200/80 bg-white/80 px-5 py-4 text-sm leading-relaxed text-zinc-600 shadow-sm shadow-zinc-950/5 dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-400">
					The component stays live on the left. The code sample stays readable
					on the right. The split line drives both clipped panes so the reveal
					feels like a single surface.
				</div>
				<CodeRevealDemo />
			</div>
		</SimpleLayout>
	);
}
