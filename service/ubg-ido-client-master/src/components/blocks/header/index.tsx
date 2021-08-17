import { FC } from 'react'
import { Link } from 'react-scroll'
import NextLink from 'next/link'
import { useSelector } from '../../../AppStores'

import { OnModalWallet } from '../../../modals'
import { Button } from '../../button'
import { Icon } from '../../icon'
import { UserAffiliateBox } from '../user-affiliate-box'
import { ESMCStatus } from '../../../services'
import { getEnv } from '../../../AppConfigs'

interface Props {
  isIDOPage?: boolean
}

export const Header: FC<Props> = (props) => {
  const smc = useSelector(state => state.smc);
  return (
    <header className="Header">
      <div className="container">
        <div className="content">
          <a href={getEnv('HOME_PAGE_URL')}>
            <img src="/images/logo.png" alt="" className="logo" />
          </a>

          <div className="nav">
            <a href={getEnv('HOME_PAGE_URL')} className="item">
              Home
            </a>
            <div className="item active">
              IDO & Airdrop
            </div>
          </div>

          <div className="rightContent">
            {smc.status === ESMCStatus.READY ? <UserAffiliateBox /> : <Button
              label="My Wallet"
              icon={Icon.Wallet}
              onClick={() => OnModalWallet()}
            />}
          </div>
        </div>
      </div>
    </header>
  )
}