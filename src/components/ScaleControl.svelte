<script lang="ts">
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.control.scale({ imperial: false, position: "bottomright" }).addTo(getMap());
</script>