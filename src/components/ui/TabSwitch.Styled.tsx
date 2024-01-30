import styled from '@emotion/styled';

export const TabSwitch = styled.div`
	display: flex;
	align-items: center;
	background-color: #fff;
	color: #0e4353;
	box-shadow: 0 0 1px 0 rgba(#185ee0, 0.15), 0 6px 12px 0 rgba(#185ee0, 0.15);
	padding: 0.7rem 0.25rem;
	max-width: 408px;
	height: 53px;
	border-radius: 99px;
	margin-bottom: 3rem;
	margin-top: 2rem;

	@media (max-width: 900px) {
		margin: 2rem auto;
		transform: scale(0.9);
	}
	@media (max-width: 360px) {
		transform: scale(0.85);
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 200px;
		font-size: 1.2rem;
		font-weight: 500;
		border-radius: 99px;
		cursor: pointer;
		transition: color 0.15s ease-in;
		z-index: 2;
		@media (max-width: 360px) {
			transform: scale(0.85);
		}

		span {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.75rem;
			width: 2rem;
			height: 2rem;
			margin-left: 0.75rem;
			border-radius: 50%;
			background-color: #e6eef9;
			transition: 0.15s ease-in;
		}
	}

	.active {
		color: white;
	}
	#running.active {
		& ~ .glider {
			transform: translateX(0);
		}
	}
	#completed.active + .glider {
		transform: translateX(100%);
		color: red !important;
	}

	#completed.active + .glider {
		transform: translateX(100%);
	}

	.active > span {
		background-color: white;
		color: #0e4353;
	}
	.glider {
		position: absolute;
		display: flex;
		height: 45px;
		width: 200px;
		background-color: #0e4353;
		z-index: 1;
		border-radius: 99px;
		transition: 0.25s ease-out;

		@media (max-width: 450px) {
			width: 49%;
		}
	}
`;
