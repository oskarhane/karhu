import styled from '@emotion/styled';

export const MainElement = styled.div`
  font-family: Arial, Helvetica, sans-serif;
  position: absolute;
  top: calc(50vh - 350px);
  left: calc(50vw - 200px);
  border: 1px solid #aaa;
  background: #eee;
  border-radius: 6px;
  opacity: 0.9;
  width: 535px;
  cursor: default;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.22), 0 2px 4px 0 rgba(0, 0, 0, 0.18);
  z-index: 9999999;
`;

export const MainInput = styled.input`
  width: calc(100% - 30px);
  height: 50px;
  margin: 15px;
  font-size: 40px;
  z-index: 9;
  outline: none;
`;

export const CommandList = styled.ul`
  padding: 0;
  margin: 0 0 4px 0;
  list-style: none;
  background: #e9e9ea;
  overflow: auto;
  max-height: calc(50vh + 150px - 80px - 14px);
  z-index: 10;
`;

type StyledItemProps = {
  active?: boolean;
};

export const CommandListItem = styled.li`
  max-height: 50px;
  background: ${(props: StyledItemProps) => (props.active ? '#256ed7' : '#e9e9ea')};
  color: ${(props: StyledItemProps) => (props.active ? '#fff' : '#000')};
  margin: 0;
  padding: 10px 20px 12px 20px;
  font-weight: 400;
  font-size: 22px;
  line-height: 16px;
  & .subtitle {
    font-size: 13px;
    font-style: italic;
    color: ${(props: StyledItemProps) => (props.active ? '#bbb' : '#8d8d8d')};
    font-weight: 400;
  }
`;
