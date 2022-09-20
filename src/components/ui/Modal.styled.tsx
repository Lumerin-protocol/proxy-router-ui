import styled from '@emotion/styled';

export const ModalBox = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;

	.modal-card {
		display: inline-block;
		overflow: hidden;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-bottom: 1rem;
		padding-top: 1.25rem;
		background-color: #ffffff;
		transition-property: all;
		text-align: left;
		vertical-align: bottom;
		border-radius: 0.5rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

		@media (min-width: 640px) {
			padding: 1.5rem;
			margin-top: 2rem;
			margin-bottom: 2rem;
			vertical-align: middle;
			width: 100%;
			max-width: 28rem;
		}
	}
`;
