import { Drawer } from '@mui/material';
import { DrawerContent } from './Navigation.styled';
import { LogoIcon } from '../../images/index';
import { PathName } from '../../types';
import MarketplaceIconActive from '../../images/icons/store-blue.png';
import MarketplaceIconInactive from '../../images/icons/store-grey.png';
import BuyerIconActive from '../../images/icons/buyer-blue.png';
import BuyerIconInactive from '../../images/icons/buyer-grey.png';
import { Link, useLocation } from 'react-router-dom';
import HelpIcon from '@mui/icons-material/Help';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import ShieldIcon from '@mui/icons-material/Shield';

// Navigation setup
interface Navigation {
	name: string;
	to: string;
	activeIcon: string;
	inactiveIcon: string;
	current: boolean;
}

export const ResponsiveNavigation = (prop: {
	sidebarOpen: boolean;
	setSidebarOpen: React.Dispatch<boolean>;
	drawerWidth: number;
}) => {
	const { pathname } = useLocation();

	const navigation: Navigation[] = [
		{
			name: 'Marketplace',
			to: PathName.Marketplace,
			activeIcon: MarketplaceIconActive,
			inactiveIcon: MarketplaceIconInactive,
			current: pathname === PathName.Marketplace,
		},
		{
			name: 'Buyer Hub',
			to: PathName.MyOrders,
			activeIcon: BuyerIconActive,
			inactiveIcon: BuyerIconInactive,
			current: pathname === PathName.MyOrders,
		},
		// {
		// 	name: 'Seller Hub',
		// 	to: PathName.MyContracts,
		// 	activeIcon: SellerIconActive,
		// 	inactiveIcon: SellerIconInactive,
		// 	current: pathname === PathName.MyContracts,
		// },
	];

	const drawer = (
		<DrawerContent>
			<nav>
				<LogoIcon className='menu-icon' />
				{navigation.map((item) => (
					<Link
						key={item.name}
						to={item.to}
						className={item.current ? 'text-lumerin-dark-blue' : 'text-lumerin-inactive-text'}
						onClick={() => {
							prop.setSidebarOpen(false);
						}}
					>
						<img src={item.current ? item.activeIcon : item.inactiveIcon} alt='' />
						<span className='item-name'>{item.name}</span>
					</Link>
				))}
			</nav>
			<div className='bottom'>
				<nav className='resources'>
					<h3>Resources</h3>
					<a href={`${process.env.REACT_APP_GITBOOK_URL}`} target='_blank' rel='noreferrer'>
						<HelpIcon style={{ fill: '#0E4353' }} />
						<span className='item-name'>Help</span>
					</a>
					<a
						href='https://github.com/Lumerin-protocol/proxy-router-ui/issues'
						target='_blank'
						rel='noreferrer'
					>
						<FlagCircleIcon style={{ fill: '#0E4353' }} />
						<span className='item-name'>Report issue</span>
					</a>
					<a href='https://lumerin.io/privacy-policy' target='_blank' rel='noreferrer'>
						<ShieldIcon style={{ fill: '#0E4353' }} />
						<span className='item-name'>Privacy Policy</span>
					</a>
				</nav>
				<div className='version'>Version: {process.env.REACT_APP_VERSION}</div>
			</div>
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
					'& .MuiDrawer-paper': {
						boxSizing: 'border-box',
						width: prop.drawerWidth,
						border: 'none',
					},
				}}
				open
			>
				{drawer}
			</Drawer>
		</>
	);
};
