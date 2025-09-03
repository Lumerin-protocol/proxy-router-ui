import styled from "@mui/material/styles/styled";

export const Card = styled("div")`
  padding: 1.5rem;
  background-color: rgba(79, 126, 145, 0.04);
  background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
  border: rgba(171, 171, 171, 1) 1px solid;
  color: #fff;
  border-radius: 9px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 8rem;
  flex: 1 1 auto;
`;

export const SmallWidget = styled(Card)`
  flex-grow: 1;
  flex-shrink: 1;
  padding: 0.5rem 1.25rem;
  margin-bottom: 0.75rem;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 215px;
  background-color: rgba(79, 126, 145, 0.04);
  background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
  border: rgba(171, 171, 171, 1) 1px solid;
  color: #fff;

  h3 {
    text-align: center;
    font-size: 0.75rem;
  }

  .link {
    padding-top: 0.375rem;
    text-align: center;
    border-top-width: 2px;
    font-size: 0.65rem;
    border-top: 1px solid #eaf7fc;
    width: 100%;
    display: flex;
    justify-content: center;
    height: 1.3rem;
  }
`;

export const MobileWidget = styled("div")`
  padding: 0.5rem;
  background-color: rgba(79, 126, 145, 0.04);
  background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
  border: rgba(171, 171, 171, 1) 1px solid;
  color: #fff;
  border-radius: 9px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
