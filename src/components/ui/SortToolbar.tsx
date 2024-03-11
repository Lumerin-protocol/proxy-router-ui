import styled from '@emotion/styled';
import { Box, FormControl, InputLabel, MenuItem, Select, Toolbar } from '@mui/material';
import React from 'react';
import { SortTypes } from '../../types';

const StyledToolbar = styled(Toolbar)`
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1rem;
	width: 100%;
	padding: 0 !important;
	select {
		background-color: none;
		border: none;
	}
`;

export const SortToolbar = (props: {
	pageTitle: string;
	sortType: string;
	setSortType: React.Dispatch<SortTypes>;
	isMobile: boolean;
}) => {
	return (
		<StyledToolbar>
			<h2 className='text-lg text-lumerin-blue-text font-Raleway font-regular text-left mb-5'>
				{!props.isMobile ? props.pageTitle : ''}
			</h2>

			<Box sx={{ minWidth: 120 }}>
				<FormControl fullWidth sx={{ border: 'none' }}>
					<InputLabel id='sort-label'>Sort By</InputLabel>
					<Select
						sx={{
							border: 'none',
							backgroundColor: '#fff',
							borderRadius: '0.5rem',
							borderWidth: '0',
						}}
						labelId='sort-label'
						id='sort'
						value={props.sortType}
						label='Sort By'
						variant='outlined'
						onChange={(e) => props.setSortType(e.target.value as SortTypes)}
					>
						{Object.values(SortTypes).map((value, key) => (
							<MenuItem value={value} key={key} sx={{ border: 'none' }}>
								{value}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
		</StyledToolbar>
	);
};
