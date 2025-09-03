import styled from "@mui/material/styles/styled";

type Props<T> = {
  readonly values: readonly Value<T>[];
  value: T;
  setValue: (value: T) => void;
};

type Value<T> = {
  readonly text: string;
  readonly value: T;
  readonly count: number;
};

export const TabSwitch = <T extends string>(props: Props<T>) => {
  const { values, value, setValue } = props;
  const [val1, val2] = values;

  return (
    <TabSwitchStyled>
      {[val1, val2].map((val) => (
        <button
          type="button"
          id={val.value}
          className={val.value === value ? "active entry" : "entry"}
          onClick={() => setValue(val.value)}
          key={val.value}
        >
          {val.text} <span>{val.count}</span>
        </button>
      ))}

      <span className="glider" />
    </TabSwitchStyled>
  );
};

export const TabSwitchStyled = styled("div")`
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  border: rgba(171, 171, 171, 1) 1px solid;
  color: #fff;
  padding: 0.7rem 0.25rem;
  border-radius: 9px;
  position: relative;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 500;
    border-radius: 99px;
    cursor: pointer;
    transition: color 0.15s ease-in;
    z-index: 2;
    padding: 0.1em 0.7em;

    @media (max-width: 500px) {
      font-size: 0.8em;
    }

    span {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75em;
      width: 2em;
      height: 2em;
      margin-left: 0.75em;
      border-radius: 50%;
      transition: 0.15s ease-in;
      color: #4c5a5f;
      background-color: #fff;
    }
  }

  .active {
    color: white;
  }

  .entry:first-of-type.active {
    & ~ .glider {
      transform: translateX(0);
    }
  }

  .entry:last-of-type.active + .glider {
    transform: translateX(calc(100% + 6px));
  }

  .active > span {
    color: #4c5a5f;
    background-color: #fff;
  }

  .glider {
    position: absolute;
    display: flex;
    top: 3px;
    left: 3px;
    bottom: 3px;
    width: calc(50% - 6px);
    background-color: #4c5a5f;
    z-index: 1;
    border-radius: 7px;
    transition: 0.25s ease-out;
  }
`;
