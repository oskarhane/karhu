import { useState, useEffect, useRef, RefObject } from 'react';
import { CommandRunResult } from '@karhu/core/lib/types';

export const ESCAPE_PRESS = 'ESCAPE_PRESS';
export const OUTSIDE_CLICK = 'OUTSIDE_CLICK';
export const COMMAND_EXECUTION = 'COMMAND_EXECUTION';

type ESCAPE_PRESS = 'ESCAPE_PRESS';
type OUTSIDE_CLICK = 'OUTSIDE_CLICK';
type COMMAND_EXECUTION = 'COMMAND_EXECUTION';
type CloseTypes = ESCAPE_PRESS | OUTSIDE_CLICK | COMMAND_EXECUTION;

type Props = {
  shouldOpen: (e: KeyboardEvent) => boolean;
  shouldClose?: (type: CloseTypes) => boolean;
  children: (props: RenderProps) => JSX.Element;
};
type HookProps = {
  shouldOpen: (e: KeyboardEvent) => boolean;
  shouldClose?: (type: CloseTypes) => boolean;
};

export type RenderProps = {
  open: boolean;
  onExec: (result: CommandRunResult) => void;
  setUIRef: RefObject<HTMLElement>;
};

function useEventListener(type: string, handler: EventListener | EventListenerObject) {
  // @ts-ignore
  const savedHandler = useRef<EventListener | EventListenerObject>();
  useEffect(
    () => {
      // @ts-ignore
      savedHandler.current = handler;
    },
    [handler],
  );
  useEffect(
    () => {
      // @ts-ignore
      const currentHandler = evt => savedHandler.current(evt);
      window.addEventListener(type, currentHandler);
      return function cleanup() {
        window.removeEventListener(type, currentHandler);
      };
    },
    [type],
  );
}

export function useToggler(props: HookProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEventListener('keydown', handleKeyPress);
  useEventListener('click', handleOutsideClick);

  function handleOutsideClick(e: any) {
    if (!open || !ref || !ref.current) {
      return;
    }
    const target = e.target;
    if (target !== ref.current && !ref.current.contains(target)) {
      close(OUTSIDE_CLICK);
      return;
    }
  }

  function handleKeyPress(e: any) {
    const { metaKey, ctrlKey, altKey, keyCode } = e;
    // Esc = close
    if (open && keyCode === 27) {
      e.preventDefault();
      close(ESCAPE_PRESS);
      return;
    }
    // Require at least one meta key
    if (!metaKey && !ctrlKey && !altKey) {
      return;
    }
    if (!open && props.shouldOpen(e)) {
      e.preventDefault();
      setOpen(true);
      return;
    }
  }

  function close(type: CloseTypes) {
    if (!props.shouldClose || props.shouldClose(type)) {
      setOpen(false);
    }
  }
  const onExec = (res: CommandRunResult) => {
    if (!res.open) {
      close(COMMAND_EXECUTION);
    }
  };
  return { open, onExec, setUIRef: ref };
}

export default function Toggler(props: Props) {
  const renderProps: RenderProps = useToggler(props);
  return !renderProps.open ? null : props.children(renderProps);
}
