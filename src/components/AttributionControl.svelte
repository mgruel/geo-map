<script lang="ts">
    import L from "leaflet";
    import { getContext } from "svelte";

    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.control.attribution({ position: "bottomright" }).addTo(getMap());
</script>
