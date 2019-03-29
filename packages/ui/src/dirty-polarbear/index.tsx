import React, { ReactEventHandler, useRef, useEffect, useState } from 'react';
import { useKarhu } from '@karhu/react';
import CommandList from './CommandList';
import { MainElement, MainInput } from './styled';
import { CommandRunResult } from '@karhu/core/lib/types';

interface InputProps {
  onChange: ReactEventHandler;
  value: string;
}

function Input(props: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.select();
      inputRef.current.focus();
    }
  }, []);
  return <MainInput type="text" ref={inputRef} onChange={props.onChange} value={props.value} />;
}

interface Props {
  onExec?: (execResult: CommandRunResult) => void;
  setUIRef?: any;
  open: boolean;
}

function DirtyPolarBear(props: Props) {
  const [input, setInput] = useState('');
  const { commandsList, exec } = useKarhu(input);

  const inputChange = (e: any) => {
    const input = e.target.value;
    setInput(input);
  };
  const onExec = (id: string) => {
    const res = exec(id);
    setInput(res.input);
    if (props.onExec) {
      props.onExec(res);
    }
  };
  if (!props.open) {
    return null;
  }
  return (
    <MainElement data-testid="dpb" className="dpb" ref={props.setUIRef}>
      <div>
        <Input value={input} onChange={inputChange} />
      </div>
      <CommandList onExec={onExec} commands={commandsList} />
    </MainElement>
  );
}

export default DirtyPolarBear;
