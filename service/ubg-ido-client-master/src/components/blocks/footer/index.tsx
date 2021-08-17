import { FC } from 'react'
import { Icon } from '../../icon'

export const Footer: FC = () => {
  return (
    <footer className="Footer">
      <div className="social">
        <a href="https://facebook.com/ubgtoken">
          <Icon.Facebook />
        </a>
        <a href="https://t.me/UBG_Token">
          <Icon.Telegram />
        </a>
        <a href="https://twitter.com/UBGToken">
          <Icon.Twitter />
        </a>
      </div>
    </footer>
  )
}