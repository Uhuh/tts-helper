import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MISSING_DESKTOP_BRIDGE_MESSAGE } from '../../src/renderer/api';
import { App } from '../../src/renderer/App';

describe('App', () => {
  beforeEach(() => {
    Reflect.deleteProperty(window, 'ttsHelper');
  });

  it('shows a helpful message instead of crashing when the Electron bridge is missing', async () => {
    render(<App />);

    expect(await screen.findByText(MISSING_DESKTOP_BRIDGE_MESSAGE)).toBeInTheDocument();
    expect(screen.getByTitle('Play next')).toBeDisabled();
  });
});
