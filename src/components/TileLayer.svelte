<script lang="ts">
    import L from "leaflet";
    import { getContext } from "svelte";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        subdomains: "abc",
        minZoom: 7,
        maxZoom: 19
    }).addTo(getMap());

    // L.control.layers({ osm }, {}, { collapsed: true, hideSingleBase: true, position: "topright" }).addTo(getMap());
</script>