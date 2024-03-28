<script>
    import L from "leaflet";
    import { getContext } from "svelte";

    const { getMap } = getContext(L);

    L.control.attribution({ position: "bottomright" }).addTo(getMap());
</script>
