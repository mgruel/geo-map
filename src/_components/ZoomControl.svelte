<script>
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext(L);
    
    L.control.zoom({ position: "topleft" }).addTo(getMap());
</script>