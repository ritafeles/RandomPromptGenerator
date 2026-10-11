// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from './main';
import { STORAGE_KEY } from './generator';
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('copies the displayed result', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  render(<App/>);
  fireEvent.click(screen.getByRole('button', { name: /プロンプトをコピー/ }));
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('コピーしました'));
  expect(writeText).toHaveBeenCalledWith((screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value);
});
it('selects output with manual-copy guidance when clipboard fails', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
  render(<App/>); fireEvent.click(screen.getByRole('button', { name: /プロンプトをコピー/ }));
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Ctrl+C'));
  const area = screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement;
  expect(document.activeElement).toBe(area); expect(area.selectionStart).toBe(0); expect(area.selectionEnd).toBe(area.value.length);
});
it('restores actual UI settings on remount and recovers corrupted storage', () => {
  const first = render(<App/>);
  fireEvent.change(screen.getByRole('combobox', { name: '髪型の候補' }), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: '髪型を固定' }));
  fireEvent.click(screen.getByRole('checkbox', { name: '瞳の色を使用する' }));
  first.unmount(); render(<App/>);
  expect((screen.getByRole('combobox', { name: '髪型の候補' }) as HTMLSelectElement).value).toBe('2');
  expect(screen.getByRole('button', { name: '髪型を固定' }).getAttribute('aria-pressed')).toBe('true');
  expect((screen.getByRole('checkbox', { name: '瞳の色を使用する' }) as HTMLInputElement).checked).toBe(false);
  cleanup(); localStorage.setItem(STORAGE_KEY, '{corrupt'); render(<App/>);
  expect(screen.getAllByRole('checkbox', {name: /を使用する/}).every(e => (e as HTMLInputElement).checked)).toBe(true);
});
it('shows only 1girl when all categories are disabled', () => {
  render(<App/>); screen.getAllByRole('checkbox', {name: /を使用する/}).forEach(e => fireEvent.click(e));
  expect((screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value).toBe('1girl');
  expect((screen.getByRole('button', { name: /ランダム生成/ }) as HTMLButtonElement).disabled).toBe(true);
});

it('adds quality tags and adult candidates, removing adult choices even when locked on exit', () => {
  render(<App/>);
  fireEvent.click(screen.getByRole('button', {name: /最高品質/}));
  expect((screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value).toContain('best quality');
  fireEvent.click(screen.getByRole('checkbox', {name: 'NSFWモード'}));
  const outfit = screen.getByRole('combobox', {name: '服装の候補'}) as HTMLSelectElement;
  const adultOption = Array.from(outfit.options).find(o=>o.textContent?.includes('サテンのランジェリー'))!;
  fireEvent.change(outfit, {target:{value:adultOption.value}});
  fireEvent.click(screen.getByRole('button', {name:'服装を固定'}));
  expect((screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value).toContain('adult woman');
  expect((screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value).toContain('satin lingerie');
  cleanup(); render(<App/>);
  expect((screen.getByRole('checkbox', {name:'NSFWモード'}) as HTMLInputElement).checked).toBe(true);
  expect((screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value).toContain('satin lingerie');
  fireEvent.click(screen.getByRole('checkbox', {name:'NSFWモード'}));
  const text = (screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value;
  expect(text).not.toContain('lingerie'); expect(text).not.toContain('adult woman');
  expect(text.startsWith('1girl, ')).toBe(true); expect(text).toContain('best quality');
});

it('adds typed custom tags to the prompt and restores them on remount', () => {
  const first = render(<App/>);
  fireEvent.change(screen.getByLabelText(/自由入力タグ/), { target: { value: 'Red Ribbon, rain' } });
  const text = () => (screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value;
  expect(text().endsWith(', red ribbon, rain')).toBe(true);
  first.unmount(); render(<App/>);
  expect((screen.getByLabelText(/自由入力タグ/) as HTMLInputElement).value).toBe('Red Ribbon, rain');
  expect(text().endsWith(', red ribbon, rain')).toBe(true);
});

it('copies a single category tag with its own button', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  render(<App/>);
  const shown = screen.getByRole('combobox', { name: '髪型の候補' }) as HTMLSelectElement;
  fireEvent.click(screen.getByRole('button', { name: '髪型のタグをコピー' }));
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('「髪型」のタグをコピーしました'));
  const copied = writeText.mock.calls[0][0] as string;
  expect(copied).not.toBe('');
  expect(copied).not.toContain('1girl');
  expect((screen.getByRole('textbox', { name: '生成されたプロンプト' }) as HTMLTextAreaElement).value).toContain(copied);
  expect(shown.value).not.toBe('');
});
