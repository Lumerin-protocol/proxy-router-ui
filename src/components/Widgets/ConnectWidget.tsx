import EastIcon from "@mui/icons-material/East";
import Avatar from "boring-avatars";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useModal } from "../../hooks/useModal";
import { ConnectBtn } from "../../pages/landing/Landing.styled";
import { AddressLength } from "../../types/types";
import { truncateAddress } from "../../utils/utils";
import { addLumerinTokenToMetaMaskAsync } from "../../web3/helpers";
import { ConnectWalletModal } from "../Forms/ConnectWalletModal";
import { ModalItem } from "../Modal";

export const ConnectWidget = () => {
  const { address: userAccount, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const connectWalletModal = useModal();

  return (
    <div style={{ minWidth: "225px" }}>
      <ModalItem open={connectWalletModal.isOpen} setOpen={connectWalletModal.setOpen}>
        <ConnectWalletModal onConnect={connectWalletModal.close} />
      </ModalItem>
      {userAccount ? (
        <ConnectBtn type="button" className="header-wallet" onClick={() => disconnect()}>
          <Avatar
            size="24px"
            name={userAccount}
            variant="marble"
            colors={["#1876D1", "#9A5AF7", "#CF9893", "#849483", "#4E937A"]}
          />
          <span className="ml-2">{truncateAddress(userAccount, AddressLength.MEDIUM)}</span>
          {connector?.icon}
        </ConnectBtn>
      ) : (
        <ConnectBtn type="button" onClick={() => connectWalletModal.open()}>
          Connect wallet
        </ConnectBtn>
      )}
    </div>
  );

  // return (
  // 	<div style={{ minWidth: '225px' }}>
  // 		<div
  // 			onClick={() => disconnect()}
  // 			onMouseOver={() => setIsHovering(true)}
  // 			onMouseOut={() => setIsHovering(false)}
  // 			className='btn-connected cursor-pointer flex justify-evenly items-center px-8'
  // 		>
  // 			<span className='pr-3'>{isHovering ? 'ChangeAccount' : truncatedWalletAddress}</span>
  // 			{connector?.icon}
  // 		</div>
  // 		<button className='link text-xs' onClick={() => addLumerinTokenToMetaMaskAsync()}>
  // 			<span style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
  // 				Import LMR into MetaMask{' '}
  // 				<EastIcon style={{ fontSize: '0.85rem', marginLeft: '0.25rem' }} />
  // 			</span>
  // 		</button>
  // 	</div>
  // );
};
