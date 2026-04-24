<script lang="ts">
    import L, { type PhotonFeature } from "leaflet";
    import { getContext } from "svelte";

    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    function describe(feature: PhotonFeature): string {
        const p = feature.properties;
        const primary = p.name ?? p.city ?? p.country ?? "Unnamed";
        const context = [p.city !== p.name ? p.city : undefined, p.state, p.country]
            .filter((part): part is string => Boolean(part) && part !== primary);
        return context.length > 0 ? `${primary}, ${context.join(", ")}` : primary;
    }

    L.Control.GeoSearch = L.Control.extend({
        options: {
            position: "topleft",
            minChars: 2,
            debounceMs: 300,
            limit: 5,
            zoom: 14,
        },

        onAdd: function (this: L.Control.GeoSearch) {
            const className = "leaflet-control-geo-search";
            this._container = L.DomUtil.create("div", className);
            this._listboxId = `${className}-listbox-${Math.random().toString(36).slice(2, 9)}`;

            this._input = L.DomUtil.create("input", `${className}__input`, this._container);
            this._input.setAttribute("type", "search");
            this._input.setAttribute("placeholder", "Search place…");
            this._input.setAttribute("aria-label", "Search for a place");
            this._input.setAttribute("role", "combobox");
            this._input.setAttribute("aria-autocomplete", "list");
            this._input.setAttribute("aria-expanded", "false");
            this._input.setAttribute("aria-controls", this._listboxId);
            this._input.setAttribute("autocomplete", "off");
            this._input.setAttribute("spellcheck", "false");

            this._listbox = L.DomUtil.create("ul", `${className}__listbox`, this._container);
            this._listbox.id = this._listboxId;
            this._listbox.setAttribute("role", "listbox");
            this._listbox.hidden = true;

            this._features = [];
            this._activeIndex = -1;
            this._debounceTimer = null;
            this._abort = null;

            L.DomEvent.disableClickPropagation(this._container);
            L.DomEvent.disableScrollPropagation(this._container);
            L.DomEvent.on(this._input, {
                input: this._onInput,
                keydown: this._onKeydown,
                focus: this._onFocus,
            }, this);
            L.DomEvent.on(this._listbox, "mousedown", this._onListboxMouseDown, this);
            L.DomEvent.on(this._listbox, "click", this._onListboxClick, this);

            return this._container;
        },

        onRemove: function (this: L.Control.GeoSearch) {
            if (this._debounceTimer !== null) {
                clearTimeout(this._debounceTimer);
                this._debounceTimer = null;
            }
            this._abort?.abort();
            L.DomEvent.off(this._input, {
                input: this._onInput,
                keydown: this._onKeydown,
                focus: this._onFocus,
            }, this);
            L.DomEvent.off(this._listbox, "mousedown", this._onListboxMouseDown, this);
            L.DomEvent.off(this._listbox, "click", this._onListboxClick, this);
        },

        _onInput: function (this: L.Control.GeoSearch) {
            const query = this._input.value.trim();
            if (this._debounceTimer !== null) {
                clearTimeout(this._debounceTimer);
            }
            if (query.length < this.options.minChars) {
                this._abort?.abort();
                this._renderResults([]);
                return;
            }
            this._debounceTimer = setTimeout(() => {
                this._debounceTimer = null;
                this._search(query);
            }, this.options.debounceMs);
        },

        _onFocus: function (this: L.Control.GeoSearch) {
            if (this._features.length > 0) {
                this._showListbox();
            }
        },

        _onKeydown: function (this: L.Control.GeoSearch, event: Event) {
            const key = (event as KeyboardEvent).key;
            if (key === "ArrowDown") {
                event.preventDefault();
                this._moveActive(1);
            } else if (key === "ArrowUp") {
                event.preventDefault();
                this._moveActive(-1);
            } else if (key === "Enter") {
                event.preventDefault();
                const index = this._activeIndex >= 0 ? this._activeIndex : 0;
                this._select(index);
            } else if (key === "Escape") {
                this._clear();
            }
        },

        _onListboxMouseDown: function (event: Event) {
            event.preventDefault();
        },

        _onListboxClick: function (this: L.Control.GeoSearch, event: Event) {
            const target = (event.target as HTMLElement | null)?.closest("li[data-index]");
            if (!target) return;
            const index = Number.parseInt(target.getAttribute("data-index") ?? "", 10);
            if (Number.isInteger(index)) {
                this._select(index);
            }
        },

        _search: async function (this: L.Control.GeoSearch, query: string) {
            this._abort?.abort();
            const controller = new AbortController();
            this._abort = controller;
            const params = new URLSearchParams({
                q: query,
                limit: String(this.options.limit),
            });
            const center = this._map.getCenter();
            params.set("lat", center.lat.toFixed(6));
            params.set("lon", center.lng.toFixed(6));
            try {
                const res = await fetch(`/api/geocode?${params.toString()}`, {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });
                if (!res.ok) {
                    this._renderResults([]);
                    return;
                }
                const data = await res.json() as { features?: PhotonFeature[] };
                this._renderResults(data.features ?? []);
            } catch (err) {
                if ((err as { name?: string }).name !== "AbortError") {
                    console.warn("[GeoSearch] request failed", err);
                    this._renderResults([]);
                }
            }
        },

        _renderResults: function (this: L.Control.GeoSearch, features: PhotonFeature[]) {
            this._features = features;
            this._activeIndex = -1;
            this._listbox.textContent = "";
            if (features.length === 0) {
                this._hideListbox();
                return;
            }
            features.forEach((feature, index) => {
                const item = L.DomUtil.create("li", `${"leaflet-control-geo-search"}__option`, this._listbox);
                item.textContent = describe(feature);
                item.setAttribute("role", "option");
                item.setAttribute("data-index", String(index));
                item.setAttribute("aria-selected", "false");
            });
            this._showListbox();
        },

        _showListbox: function (this: L.Control.GeoSearch) {
            this._listbox.hidden = false;
            this._input.setAttribute("aria-expanded", "true");
        },

        _hideListbox: function (this: L.Control.GeoSearch) {
            this._listbox.hidden = true;
            this._input.setAttribute("aria-expanded", "false");
            this._input.removeAttribute("aria-activedescendant");
        },

        _moveActive: function (this: L.Control.GeoSearch, delta: number) {
            if (this._features.length === 0) return;
            const next = (this._activeIndex + delta + this._features.length) % this._features.length;
            this._setActive(next);
        },

        _setActive: function (this: L.Control.GeoSearch, index: number) {
            const items = this._listbox.querySelectorAll<HTMLLIElement>("li[data-index]");
            items.forEach((item, i) => {
                const selected = i === index;
                item.setAttribute("aria-selected", selected ? "true" : "false");
                item.classList.toggle("is-active", selected);
                if (selected) {
                    this._input.setAttribute("aria-activedescendant", item.id || `${this._listboxId}-${i}`);
                }
            });
            this._activeIndex = index;
        },

        _select: function (this: L.Control.GeoSearch, index: number) {
            const feature = this._features[index];
            if (!feature) return;
            const [lon, lat] = feature.geometry.coordinates;
            this._map.flyTo([lat, lon], this.options.zoom, { animate: true });
            this._input.value = describe(feature);
            this._clear();
        },

        _clear: function (this: L.Control.GeoSearch) {
            this._features = [];
            this._activeIndex = -1;
            this._listbox.textContent = "";
            this._hideListbox();
        },
    }) as unknown as typeof L.Control.GeoSearch;

    L.control.geoSearch = function (options?: Partial<L.GeoSearchOptions>) {
        return new L.Control.GeoSearch(options);
    };

    L.control.geoSearch({ position: "topleft" }).addTo(getMap());
</script>

<svelte:head>
    <style>
        .leaflet-control-geo-search {
            background: rgba(255, 255, 255, 1.0);
            border: 2px solid rgba(0, 0, 0, 0.35);
            padding: 2px 5px 1px;
            font-size: 14px;
            border-radius: 3px;
            min-width: 240px;
        }

        .leaflet-control-geo-search__input,
        .leaflet-control-geo-search__input:active,
        .leaflet-control-geo-search__input:focus {
            outline: none !important;
            border: 0;
            width: 100%;
            padding: 2px 0;
            background: transparent;
        }

        .leaflet-control-geo-search__listbox {
            list-style: none;
            margin: 4px -5px -1px;
            padding: 0;
            border-top: 1px solid rgba(0, 0, 0, 0.15);
            max-height: 200px;
            overflow-y: auto;
        }

        .leaflet-control-geo-search__listbox[hidden] {
            display: none;
        }

        .leaflet-control-geo-search__option {
            padding: 4px 8px;
            cursor: pointer;
        }

        .leaflet-control-geo-search__option:hover,
        .leaflet-control-geo-search__option.is-active {
            background: rgba(0, 0, 0, 0.08);
        }
    </style>
</svelte:head>
