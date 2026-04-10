import type { Metadata } from "next";
import { CodeRevealDemo } from "@/components/examples/CodeRevealDemo";
import { EnvMaskRevealDemo } from "@/components/examples/EnvMaskRevealDemo";
import { SimpleLayout } from "@/components/SimpleLayout";

export const metadata: Metadata = {
	title: "Component Code Reveal",
	description:
		"Interactive split-view examples for revealing component source and masking environment variables.",
};

export default function CodeRevealPage() {
	return (
		<SimpleLayout
			title="Component / code reveal"
			intro="A small interaction demo collection: drag the divider to compare two states of the same surface, from live UI versus source to raw config versus masked output."
		>
			<div className="space-y-6">
				<div className="rounded-3xl border border-zinc-200/80 bg-white/80 px-5 py-4 text-sm leading-relaxed text-zinc-600 shadow-sm shadow-zinc-950/5 dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-400">
					The component stays live on the left. The code sample stays readable
					on the right. The split line drives both clipped panes so the reveal
					feels like a single surface.
				</div>
				<CodeRevealDemo />
				<div className="rounded-3xl border border-zinc-200/80 bg-white/80 px-5 py-4 text-sm leading-relaxed text-zinc-600 shadow-sm shadow-zinc-950/5 dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-400">
					The same interaction also works for secrets: slide between the raw
					environment and a share-safe version where every value is replaced
					with asterisks.
				</div>
				<EnvMaskRevealDemo />
			</div>
		</SimpleLayout>
	);
}
