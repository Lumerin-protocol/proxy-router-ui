import styled from "@emotion/styled";

export const InputWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin-top: 1.3rem;

  @media (max-width: 600px) {
    margin-top: 0;
  }
  label {
    font-size: 1rem;
  }
  .MuiTextField-root {
    width: 100%;
  }
`;

export const ReviewItems = styled.div`
  div {
    display: flex;
    justify-content: space-between;
    margin: 1.25rem 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eaf7fc;
    &:last-child {
      border-bottom: none;
    }
    h3 {
      font-size: 0.85rem;
      align-self: center;
    }
    p {
      color: #fff;
      font-weight: 500;
    }
  }

  .total-cost {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    .price {
      font-size: 2rem;
    }
  }
`;
