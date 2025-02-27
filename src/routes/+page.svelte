<script lang="ts">
	import {testReport} from "$lib/test";
    import {getPrefixes} from "$lib";
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import {dev} from "$app/environment";

    // let report = $state("");
    let report = $state(dev ? testReport : "");

    let filteredReport = $derived(
        report
            .split("\n")
            .find(l => l.trim().startsWith("Threads:"))
            ?.split("{ ")[1]
            .split(" }")[0]
            .replaceAll("], ", "],\n")
            .split("\n")
            .map(l => {
                const parts = l.split(": ");
                const infoParts = parts.shift()?.split(" ");
                const status = infoParts?.shift() as string;
                let name = infoParts?.join(" ") as string;
                let stack = parts.join(" ");

                stack = stack
                    .substring(1, stack.length - 2) // to remove []
                    .split(", ")
                    .join("\n")

                return {status, name, stack}
            })
            .sort((a, b) => a.name.localeCompare(b?.name))

    )
    let prefixes = $derived(getPrefixes(filteredReport?.map(t => t.name) ?? []).sort((a, b) => b.matches - a.matches))
</script>


<svelte:head>
    <title>Crash Report Analyser</title>
</svelte:head>

<div class="max-w-xl mx-auto p-2">
    <textarea class="input w-128" bind:value={report} placeholder="Paste crash report here"></textarea>
</div>
<!--<pre>{JSON.stringify(filteredReport, undefined, '\t')}</pre>-->
{#if !report}
    <div class="text-center">
        <div class="inline-block text-left">
            Paste a crash report above, and this page will parse the threads list in it for easier viewing.<br>
            Don't worry, the crash report will not leave your browser.
        </div>
    </div>
{:else}
    <div class="text-center">
        <div class="inline-block text-left">
            Here is a list of threads that appeared in the crash report.<br>
            They are grouped by common prefixes, which usually means that threads from the same plugin are grouped together.
        </div>
    </div>
    <Accordion>
        {#each prefixes as prefix}
            {@const matchingThreads = filteredReport?.filter(t => t.name.startsWith(prefix.prefix)) ?? []}
            <AccordionItem>
                <svelte:fragment slot="summary">{prefix.prefix} ({prefix.matches})</svelte:fragment>
                <svelte:fragment slot="content">
                    <!--                <pre>{JSON.stringify(matchingThreads, undefined, '\t')}</pre>-->
                    <Accordion>
                        {#each matchingThreads as thread}
                            <AccordionItem>
                                <svelte:fragment slot="summary">
                                    {thread.name}
                                    <span class="opacity-60 ml-4">
                                    {thread.status}
                                </span>
                                </svelte:fragment>
                                <svelte:fragment slot="content"><pre>{thread.stack}</pre></svelte:fragment>
                            </AccordionItem>
                        {/each}
                    </Accordion>
                </svelte:fragment>
            </AccordionItem>
        {/each}
    </Accordion>
{/if}