import { render, screen } from "@testing-library/svelte";
import { expect, test, describe } from "vitest";
import App from "./App.svelte";

describe("App", () => {
    test("renders leaflet link", () => {
        render(App);
        const leafletLink = screen.getByText(/leaflet/i);
        expect(leafletLink).toBeInTheDocument();
    });
});
