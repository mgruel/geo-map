<script>
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext(L);

    L.control.scale({ imperial: false, position: "bottomright" }).addTo(getMap());
</script>