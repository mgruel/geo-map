import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import L from 'leaflet';
import JumpToFixture from './JumpTo.fixture.svelte';

function getInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>('.leaflet-control-jump-to__input');
    if (!input) throw new Error('JumpTo input not found');
    return input;
}

function pressEnter(input: HTMLInputElement) {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

function beforeInput(input: HTMLInputElement, data: string): InputEvent {
    const event = new InputEvent('beforeinput', {
        inputType: 'insertText',
        data,
        cancelable: true,
        bubbles: true,
    });
    input.dispatchEvent(event);
    return event;
}

describe('JumpTo', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders a label and input inside the map', () => {
        const { container } = render(JumpToFixture);
        expect(container.querySelector('.leaflet-control-jump-to')).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-jump-to__label')?.textContent).toBe('Jump to:');
        expect(container.querySelector('.leaflet-control-jump-to__input')).toBeInTheDocument();
    });

    it('flies to valid coordinates on Enter and clears the input', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = '48.5, 8.8';
        pressEnter(input);
        expect(flySpy).toHaveBeenCalledTimes(1);
        expect(flySpy.mock.calls[0][0]).toEqual([48.5, 8.8]);
        expect(input.value).toBe('');
    });

    it('ignores input with fewer than two parts', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = '48.5';
        pressEnter(input);
        expect(flySpy).not.toHaveBeenCalled();
        expect(input.value).toBe('48.5');
    });

    it('ignores input with more than two parts', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = '48.5,8.8,7';
        pressEnter(input);
        expect(flySpy).not.toHaveBeenCalled();
    });

    it('ignores NaN coordinates', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = 'foo,bar';
        pressEnter(input);
        expect(flySpy).not.toHaveBeenCalled();
    });

    it('rejects latitude outside [-90, 90]', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = '91,0';
        pressEnter(input);
        expect(flySpy).not.toHaveBeenCalled();
        input.value = '-91,0';
        pressEnter(input);
        expect(flySpy).not.toHaveBeenCalled();
    });

    it('rejects longitude outside [-180, 180]', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = '0,181';
        pressEnter(input);
        expect(flySpy).not.toHaveBeenCalled();
        input.value = '0,-181';
        pressEnter(input);
        expect(flySpy).not.toHaveBeenCalled();
    });

    it('accepts boundary values', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = '90,180';
        pressEnter(input);
        expect(flySpy).toHaveBeenCalledTimes(1);
        expect(flySpy.mock.calls[0][0]).toEqual([90, 180]);
    });

    it('does nothing on non-Enter keydown', () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        input.value = '48.5,8.8';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
        expect(flySpy).not.toHaveBeenCalled();
        expect(input.value).toBe('48.5,8.8');
    });

    it('blocks non-numeric characters via beforeinput', () => {
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        const event = beforeInput(input, 'a');
        expect(event.defaultPrevented).toBe(true);
    });

    it('allows digits, comma, and period via beforeinput', () => {
        const { container } = render(JumpToFixture);
        const input = getInput(container);
        for (const data of ['1', '2', '9', '0', '.', ',']) {
            const event = beforeInput(input, data);
            expect(event.defaultPrevented, `"${data}" should be allowed`).toBe(false);
        }
    });
});
