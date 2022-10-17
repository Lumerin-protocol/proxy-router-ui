import { Drawer } from '@mui/material';
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
import HelpIcon from '@mui/icons-material/Help';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import PolicyIcon from '@mui/icons-material/Policy';

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
			<div className='resources'>
				<h3>Resources</h3>
				<a
					href='https://app.gitbook.com/o/LyHwPIWryy8bgL99GNF6/s/LOJKfuh83H9XvKG0vaoH/'
					target='_blank'
					rel='noreferrer'
				>
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
				<a href='#' target='_blank' rel='noreferrer'>
					<PolicyIcon style={{ fill: '#0E4353' }} />
					<span className='item-name'>Coinspect audit</span>
				</a>
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
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: prop.drawerWidth },
				}}
				open
			>
				{drawer}
			</Drawer>
		</>
	);
};
