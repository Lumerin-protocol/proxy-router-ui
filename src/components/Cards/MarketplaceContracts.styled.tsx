import styled from "@mui/material/styles/styled";

export const MarketplaceCards = styled("div")`
  width: 100%;
  margin: 0;
  display: grid;
  gap: 1rem;
  font-family: Inter, sans-serif;

  @media (min-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  .marketplace-card {
    background-color: rgba(79, 126, 145, 0.04);
    background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
    border: rgba(171, 171, 171, 1) 1px solid;
    color: #fff;
    border-radius: 9px;
    padding: 1.75rem;
    padding-bottom: 1rem;
    margin-bottom: 1rem;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 1rem;

      .contract-info {
        flex: 1;

        h3 {
          font-size: 0.65rem;
          font-weight: 300;
          margin-bottom: 0.6rem;
          color: #999999;
        }

        a {
          font-weight: 400;
          text-decoration: underline;
          font-size: 0.85rem;
        }
      }

      .stats-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 60px;

        h3 {
          font-size: 0.65rem;
          font-weight: 300;
          margin-bottom: 0.6rem;
          color: #999999;
        }

        .stats-icon {
          display: flex;
          justify-content: center;
          align-items: center;

          .list-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            border: rgba(171, 171, 171, 1) 1px solid;
            border-radius: 9px;
            background-color: rgba(79, 126, 145, 0.04);
            background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
            transition: all 0.2s ease;

            &:hover {
              transform: scale(1.05);
            }

            svg {
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }
          }
        }
      }
    }

    .terms {
      display: grid;
      grid-template-columns: minmax(150px, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;

      .item-value {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-bottom: 0.8rem;
        min-width: 0; // Prevents grid items from overflowing

        img, wui-avatar {
          width: 20px;
          height: 20px;
          margin-right: 0.75rem;
        }

        div {
          display: flex;
          flex-direction: column;

          h3 {
            font-size: 0.65rem;
            font-weight: 300;
            margin-bottom: 0.25em;
            color: #999999;
          }

          p {
            font-weight: 400;
            font-size: 0.85rem;
            margin: 0;
          }

          .fee-text {
            font-size: 0.75rem;
            color: #999999;
            margin-top: 0.25rem;
          }

          .price-per-hour-text {
            font-size: 0.7rem;
            color: #4f7e91;
            font-weight: 500;
          }

          .price-container {
            display: flex;
            justify-content: space-between;
            flex-direction: row;
            align-items: center;
            width: 250px;
          }
        }
      }
    }

    .stats-block {
      margin-bottom: 1.5rem;

      h3 {
        font-size: 0.65rem;
        font-weight: 300;
        margin-bottom: 0.6rem;
        color: #999999;
      }
    }

    .seller-info {
      margin-bottom: 1.5rem;

      .item-value {
        display: flex;
        flex-direction: row;
        align-items: center;

        img, wui-avatar {
          width: 20px;
          height: 20px;
          margin-right: 0.75rem;
        }

        div {
          display: flex;
          flex-direction: column;

          h3 {
            font-size: 0.65rem;
            font-weight: 300;
            margin-bottom: 0.25em;
            color: #999999;
          }

          p {
            font-weight: 400;
            font-size: 0.85rem;
            margin: 0;
          }
        }
      }
    }

    .seller-producer-info {
      margin-bottom: 1.5rem;

      .item-value {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2rem;

        .seller-section,
        .producer-section {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex: 1;

          img, wui-avatar {
            width: 20px;
            height: 20px;
            margin-right: 0.75rem;
          }

          div {
            display: flex;
            flex-direction: column;

            h3 {
              font-size: 0.65rem;
              font-weight: 300;
              margin-bottom: 0.25em;
              color: #999999;
            }

            p {
              font-weight: 400;
              font-size: 0.85rem;
              margin: 0;
            }
          }
        }
      }
    }

    .card-actions {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }
  }
`;
