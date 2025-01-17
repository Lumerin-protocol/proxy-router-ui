import { Drawer } from '@mui/material';
import { DrawerContent, Socials } from './Navigation.styled';
import { PathName } from '../../types';
import MarketplaceIconActive from '../../images/icons/store-blue.png';
import MarketplaceIconInactive from '../../images/icons/store-grey.png';
import LogoIcon from '../../images/icons/nav-logo-white.png';
import BuyerIconActive from '../../images/icons/buyer-blue.png';
import BuyerIconInactive from '../../images/icons/buyer-grey.png';
// import SellerIconActive from '../../images/icons/seller-blue.png';
// import SellerIconInactive from '../../images/icons/seller-grey.png';
import { Link } from 'react-router-dom';
import HelpIcon from '@mui/icons-material/Help';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTiktok,
	faMedium,
	faDiscord,
	faTelegram,
	faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

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
		// {
		// 	name: 'Seller Hub',
		// 	to: PathName.MyContracts,
		// 	activeIcon: SellerIconActive,
		// 	inactiveIcon: SellerIconInactive,
		// 	current: prop.pathName === PathName.MyContracts,
		// },
	];

	const drawer = (
		<DrawerContent>
			<nav>
				<img src={LogoIcon} alt='' className='menu-icon' style={{ width: '100%' }} />
				{navigation.map((item) => (
					<Link
						key={item.name}
						to={item.to}
						// className={item.current ? 'text-lumerin-dark-blue' : 'text-lumerin-inactive-text'}
						onClick={() => {
							prop.setSidebarOpen(false);
							prop.setPathname(item.to);
						}}
					>
						{/* <img src={item.current ? item.activeIcon : item.inactiveIcon} alt='' /> */}
						<img src={item.inactiveIcon} alt='' />
						<span className='item-name' style={{ fontWeight: item.current ? 700 : 400 }}>
							{item.name}
						</span>
					</Link>
				))}
			</nav>
			<div className='bottom'>
				<nav className='resources'>
					<h3>Resources</h3>
					<a href={`${process.env.REACT_APP_GITBOOK_URL}`} target='_blank' rel='noreferrer'>
						<HelpIcon style={{ fill: '#509EBA' }} />
						<span className='item-name'>Help</span>
					</a>
					<a
						href='https://github.com/Lumerin-protocol/proxy-router-ui/issues'
						target='_blank'
						rel='noreferrer'
					>
						<FlagCircleIcon style={{ fill: '#509EBA' }} />
						<span className='item-name'>Report issue</span>
					</a>
					<a href='https://lumerin.io/privacy-policy' target='_blank' rel='noreferrer'>
						<ShieldIcon style={{ fill: '#509EBA' }} />
						<span className='item-name'>Privacy Policy</span>
					</a>
				</nav>
				<div className='version'>Version: {process.env.REACT_APP_VERSION}</div>
				<Socials>
					{[
						{ link: 'https://discord.gg/lumerin', icon: faDiscord },
						{ link: 'https://medium.com/titan-mining-blog', icon: faMedium },
						{ link: 'https://t.me/LumerinOfficial', icon: faTelegram },
						{ link: 'http://twitter.com/hellolumerin', icon: faXTwitter },
						{ link: 'https://www.tiktok.com/@hellolumerin_', icon: faTiktok },
					].map((item) => (
						<a href={item.link} target='_blank' rel='noreferrer'>
							<FontAwesomeIcon icon={item.icon} color='#fff' />
						</a>
					))}
				</Socials>
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
						backgroundColor: 'rgba(79, 126, 145, 0.04)',
						background:
							'radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, .05) 100%)',
						// borderRight: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(171,171,171,1) 100%)',
						borderRight: 'rgba(171,171,171,1) 1px solid',
					},
				}}
				open
			>
				{drawer}
			</Drawer>
		</>
	);
};
