<script lang="ts">
    import L from "leaflet";
    import {getContext} from "svelte";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        subdomains: "abc",
        minZoom: 7,
        maxZoom: 19
    }).addTo(getMap());

    const cycling = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &amp; <a href="https://github.com/cyclosm/cyclosm-cartocss-style/">Cyclosm</a>`,
        subdomains: "abc",
        minZoom: 7,
        maxZoom: 17,
    });

    L.control.layers({ osm, cycling }, {}, { collapsed: true, hideSingleBase: true, position: "topright" }).addTo(getMap());
</script>