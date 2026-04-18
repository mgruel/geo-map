<script lang="ts">
    import { onMount, setContext, type Snippet } from "svelte";
    import L from "leaflet";

    let { children }: { children?: Snippet } = $props();

    let map = $state<L.Map>();
    let container: HTMLDivElement;

    setContext(L, {
        getMap: () => map
    });

    onMount(() => {
        map = L.map(container, {
            center: [48.594662, 8.867683],
            zoom: 11,
            minZoom: 7,
            zoomControl: false,
            attributionControl: false,
            maxBoundsViscosity: 1.0
        });

        return () => {
            map?.remove();
            map = undefined;
        };
    });
</script>

<div class="map" bind:this={container}>
    {#if map}
        {@render children?.()}
    {/if}
</div>

<style>
    @import 'leaflet/dist/leaflet.css';

    .map {
        width: 100%;
        height: 100%;
    }
</style>
