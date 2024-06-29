<script>
    import AttributionControl from "./_components/AttributionControl.svelte";
    import Coordinates from "./_components/Coordinates.svelte";
    import JumpTo from "./_components/JumpTo.svelte";
    import Map from "./_components/Map.svelte";
    import ScaleControl from "./_components/ScaleControl.svelte";
    import TileLayer from "./_components/TileLayer.svelte";
</script>

<Map>
    <TileLayer />
    <AttributionControl />
    <JumpTo />
    <ScaleControl />
    <Coordinates />
</Map>
