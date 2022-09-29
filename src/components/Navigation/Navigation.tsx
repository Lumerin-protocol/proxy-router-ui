import { IconButton, Drawer } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DrawerContent } from './Navigation.styled';
import { LogoIcon } from '../../images/index';
import { PathName } from '../../types';
import MarketplaceIconActive from '../../images/icons/store-blue.png';
import MarketplaceIconInactive from '../../images/icons/store-grey.png';
import BuyerIconActive from '../../images/icons/buyer-blue.png';
import BuyerIconInactive from '../../images/icons/buyer-grey.png';
import SellerIconActive from '../../images/icons/seller-blue.png';
import SellerIconInactive from '../../images/icons/seller-grey.png';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

// Navigation setup
interface Navigation {
	name: string;
	to: string;
	activeIcon: string;
	inactiveIcon: string;
	current: boolean;
}

const ActiveNavTab = styled.div`
	background: #0e4353;
	position: absolute;
	width: 6px;
	height: 36px;
	left: 0px;
	margin-top: 0.2rem;
	border-radius: 0px 15px 15px 0px;
`;

export const ResponsiveNavigation = (prop: {
	sidebarOpen: boolean;
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setPathname: React.Dispatch<React.SetStateAction<string>>;
	pathName: string;
	drawerWidth: number;
}) => {
	const navigation: Navigation[] = [
		{
			name: 'Marketplace',
			to: PathName.Marketplace,
			activeIcon: MarketplaceIconActive,
			inactiveIcon: MarketplaceIconInactive,
			current: prop.pathName === PathName.Marketplace,
		},
		{
			name: 'Buyer Hub',
			to: PathName.MyOrders,
			activeIcon: BuyerIconActive,
			inactiveIcon: BuyerIconInactive,
			current: prop.pathName === PathName.MyOrders,
		},
		{
			name: 'Seller Hub',
			to: PathName.MyContracts,
			activeIcon: SellerIconActive,
			inactiveIcon: SellerIconInactive,
			current: prop.pathName === PathName.MyContracts,
		},
	];

	const drawer = (
		<DrawerContent>
			<nav>
				<LogoIcon className='menu-icon' />
				{navigation.map((item) => (
					<>
						<Link
							key={item.name}
							to={item.to}
							className={item.current ? 'text-lumerin-dark-blue' : 'text-lumerin-inactive-text'}
							onClick={() => {
								prop.setSidebarOpen(false);
								prop.setPathname(item.to);
							}}
						>
							<img src={item.current ? item.activeIcon : item.inactiveIcon} alt='' />
							<span className='item-name'>{item.name}</span>
						</Link>
					</>
				))}
			</nav>
		</DrawerContent>
	);
	return (
		<>
			<Drawer
				variant='temporary'
				anchor='left'
				open={prop.sidebarOpen}
				onClose={() => prop.setSidebarOpen(false)}
				transitionDuration={{ appear: 500, enter: 500, exit: 500 }}
				ModalProps={{
					keepMounted: true,
				}}
				sx={{
					display: { xs: 'block', md: 'none' },
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: prop.drawerWidth },
				}}
			>
				{drawer}
			</Drawer>
			<Drawer
				variant='permanent'
				sx={{
					display: { xs: 'none', md: 'block' },
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: prop.drawerWidth },
				}}
				open
			>
				{drawer}
			</Drawer>
		</>
	);
};
