import { FC } from 'react'
import { Icon } from '../../icon'

export const Footer: FC = () => {
  return (
    <footer className="Footer">
      <div className="social">
        <a href="https://facebook.com">
          <Icon.Facebook />
        </a>
        <a href="https://facebook.com">
          <Icon.Telegram />
        </a>
        <a href="https://facebook.com">
          <Icon.Twitter />
        </a>
      </div>
    </footer>
  )
}