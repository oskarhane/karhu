import React from 'react';
import { render } from 'react-testing-library';
import { Portal } from '../src';

let portalRoot = document.getElementById('portal');
if (!portalRoot) {
  portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'portal');
  document.body.appendChild(portalRoot);
}

test('renders the children in a portal', () => {
  const My = () => <div className="my">hello</div>;

  const { container, baseElement } = render(
    <Portal element={portalRoot}>
      <My />
    </Portal>,
  );

  expect(baseElement.querySelector('.my')).not.toBeNull();
  expect(container.querySelector('.my')).toBeNull();
});
