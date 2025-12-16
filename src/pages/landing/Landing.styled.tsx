import styled from "@mui/material/styles/styled";
import { PrimaryButton } from "../../components/Forms/FormButtons/Buttons.styled";
//@ts-ignore
import BackgroundDots from "../../images/landing-bg-dots.png?quality=40&alphaQuality=40&w=1000";
import Grid from "../../images/landing-grid.png";

export const HeroWrapper = styled("div")`
  min-height: 100vh;
  padding-top: 5rem;
  width: 100%;

  background-image: url(${Grid}), url(${BackgroundDots}),
    radial-gradient(ellipse 90% 350% at 82% 50%, rgb(41, 50, 54) 15%, #1e1e1e 35%);
  background-position: right 50px top 60px, top right, top right;
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-size: 65%, 40%, contain;

  @media (max-width: 650px) {
    background-image: url(${BackgroundDots}),
      radial-gradient(ellipse 100% 80% at 50% 20%, rgb(41, 50, 54) 50%, #1e1e1e 75%);
    background-size: 70%, 60%;
    background-position: top right, top right;
    background-repeat: no-repeat, no-repeat;
    background-size: contain, cover;
  }

  .content-wrapper {
    max-width: 1150px;
    margin: 0 auto;
    padding: 2rem;
    padding-bottom: 5rem;
  }

  .hero {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 5rem;
  }

  .right {
    max-width: 500px;

    @media (max-width: 650px) {
      display: none;
    }
  }
  p {
    color: #fff;
    font-family: Montserrat;
  }

  h3 {
    color: #fff;
    font-size: 1.75rem;
    font-weight: 600;
    font-family: Raleway;
    margin-top: 2rem;
    @media (max-width: 650px) {
      font-size: 1.5rem;
    }
  }

  .instructions-link {
    color: #fff;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .arrow-icon {
    font-size: 0.95rem;
    margin-left: 0.25rem;
  }
`;

export const HeroHeadline = styled("h1")`
  font-size: 4rem;
  font-weight: 700;
  color: #fff;
  font-family: Raleway;
  line-height: 1.25;

  @media (max-width: 450px) {
    font-size: 3rem;
  }
`;

export const HeroSubheadline = styled("div")`
  font-size: 1.5rem;
  max-width: 400px;
  margin-bottom: 1.5rem;
  color: #fff;
`;

export const Steps = styled("ul")`
  display: flex;
  flex-direction: row;
  margin-top: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 650px) {
    flex-direction: column;
    justify-content: center;
    .step {
      margin-right: 1rem;
      margin-bottom: 0rem;
    }
    li {
      display: flex;
      flex-direction: row;
      margin-bottom: 1rem;
    }
  }

  .step {
    border-radius: 50%;
    background: #eaf7fc;
    width: 75px;
    height: 75px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Inter, sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    max-width: 50%;
  }
`;

export const ConnectBtn = styled(PrimaryButton)`
  background-color: #4c5a5f;
  background: #4c5a5f
    linear-gradient(45deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
  color: #fff;
  font-weight: 500;
  padding: 0.75rem 1.75rem;
  flex-shrink: 0;
`;

export const ButtonsWrapper = styled("div")`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
`;
