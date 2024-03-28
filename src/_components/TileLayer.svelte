<script>
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext(L);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        subdomains: "abc",
        minzoom: 7,
        maxZoom: 19
    }).addTo(getMap());

    // Disabled because it's should not be used
    // const createCartoUrl = (style) => `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}${L.Browser.retina ? "@2x.png" : ".png"}`;
    // const voyager = L.tileLayer(createCartoUrl("rastertiles/voyager"), {
    //     attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>, &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
    //     subdomains: "abcd",
    //     minZoom: 7,
    //     maxZoom: 20
    // });

    L.control.layers({ osm }, {}, { collapsed: true, hideSingleBase: false, position: "topright" }).addTo(getMap());
</script>