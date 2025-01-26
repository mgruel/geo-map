<script lang="ts">
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);
    
    L.control.zoom({ position: "topleft" }).addTo(getMap());
</script>