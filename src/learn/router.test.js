import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { addNavigationGuard, navigate, parseHash, toHash, unitRoute, useRoute } from './router';

afterEach(() => {
  window.location.hash = '';
});

test.each([
  ['', { page: 'home' }],
  ['#', { page: 'home' }],
  ['#/', { page: 'home' }],
  ['#/unit-05', { page: 'unit', key: 'unit-05' }],
  ['#unit-05', { page: 'unit', key: 'unit-05' }],
  ['#/unit-05/', { page: 'unit', key: 'unit-05' }],
  ['#/playground', { page: 'playground' }],
  ['#playground', { page: 'playground' }],
  ['#/unit-5', { page: 'not-found', path: 'unit-5' }],
  ['#/whatever', { page: 'not-found', path: 'whatever' }],
])('parseHash(%p)', (hash, expected) => {
  expect(parseHash(hash)).toEqual(expected);
});

test('toHash round-trips every page', () => {
  [{ page: 'home' }, { page: 'playground' }, unitRoute('unit-09')].forEach((route) => {
    expect(parseHash(toHash(route))).toEqual(route);
  });
});

test('navigate changes the hash unless a guard blocks it', () => {
  expect(navigate(unitRoute('unit-02'))).toBe(true);
  expect(window.location.hash).toBe('#/unit-02');

  const guard = jest.fn(() => false);
  const remove = addNavigationGuard(guard);
  expect(navigate({ page: 'home' })).toBe(false);
  expect(guard).toHaveBeenCalledWith({ page: 'home' });
  expect(window.location.hash).toBe('#/unit-02');

  remove();
  expect(navigate({ page: 'home' })).toBe(true);
  expect(window.location.hash).toBe('#/');
});

test('useRoute follows hash changes', () => {
  function Probe() {
    const route = useRoute();
    return <span>{route.page === 'unit' ? route.key : route.page}</span>;
  }
  render(<Probe />);
  expect(screen.getByText('home')).toBeInTheDocument();
  act(() => {
    window.location.hash = '#/unit-03';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  expect(screen.getByText('unit-03')).toBeInTheDocument();
});
