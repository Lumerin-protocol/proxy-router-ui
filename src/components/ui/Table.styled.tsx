import styled from '@emotion/styled';
import { colors } from '../../../styles/styles.config';

export const StyledTable = styled.table`
  borderSpacing: 0,
  color: ${colors['lumerin-table-text-color']}
  
  > thead > tr > th::selection': {
    display: 'none'
  }

  > thead > tr > th:hover': {
    backgroundColor: ${colors['lumerin-aqua']},
    color: 'white'
  }

  > thead > tr > th:first-child:hover': {
    backgroundColor: ${colors['lumerin-dark-gray']},
    color: 'inherit'
  }

  > thead > tr > th:last-child:hover': {
    backgroundColor: ${colors['lumerin-dark-gray']},
    color: 'inherit'
  }

  > thead > tr > th:first-child': {
    border: '0px solid transparent'
    borderRadius: '5px 0 0 5px'
  }

  > thead > tr > th:last-child': {
    borderRadius: '0 5px 5px 0'
  }

  > tbody > tr:first-child': {
    pointerEvents: 'none'
  }

  > tbody > tr:first-child > td': {
    border: 'none'
  }

  > tbody > tr:first-child > td:last-child': {
    borderRight: 'none !important'
  }

  > tbody > tr > td': {
    backgroundColor: 'white'
    border: 1px solid ${colors['lumerin-gray']}

    borderBottom: 'none'
  }

  > tbody > tr > td:first-child': {
    borderRight: 'none'
  }

  > tbody > tr > td:first-child:hover': {
    backgroundColor: ${colors['lumerin-aqua']},
    color: 'white'
  }

  > tbody > tr > td:last-child': {
    borderLeft: 'none'
    borderRight: 1px solid ${colors['lumerin-gray']} !important,
  }

  > tbody > tr > td:nth-child(2)': {
    borderLeft: 'none'
    borderRight: 'none'
  }

  > tbody > tr:nth-child(2) > td:first-child': {
    borderTopLeftRadius: '5px'
  }

  > tbody > tr:nth-child(2) > td:last-child': {
    borderTopRightRadius: '5px'
  }

  > tbody > tr > td:nth-child(3)': {
    borderLeft: 'none'
    borderRight: 'none'
  }

  > tbody > tr > td:nth-child(4)': {
    borderLeft: 'none'
    borderRight: 'none'
  }

  > tbody > tr > td:nth-child(5)': {
    borderLeft: 'none'
    borderRight: 'none'
  }

  > tbody > tr > td:nth-child(6)': {
    borderLeft: 'none'
    borderRight: 'none'
  }

  > tbody > tr:last-child > td': {
    borderBottom: 1px solid ${colors['lumerin-gray']}

  }

  > tbody > tr:last-child > td:first-child': {
    borderBottomLeftRadius: '5px'
  }

  > tbody > tr:last-child > td:last-child': {
    borderBottomRightRadius: '5px'
    paddingRight: '0.5rem'
  }
`;
