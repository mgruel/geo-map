<style>
    @import 'leaflet/dist/leaflet.css';

    .map {
        width: 100%;
        height: 100%;
    }
</style>

<script lang="ts">
    import { setContext } from "svelte";
    import L from "leaflet";
    
    let map: L.Map;
    
    setContext(L, {
        getMap: () => map
    });
    
    function createMap(container: HTMLElement) {
        map = L.map(container, {
            center: [48.594662,8.867683],
            zoom: 11,
            minZoom: 7,
            zoomControl: false,
            attributionControl: false,
            maxBoundsViscosity: 1.0
        });
    }
</script>

<div class="map" use:createMap>
    {#if map}
        <slot></slot>
    {/if}
</div>