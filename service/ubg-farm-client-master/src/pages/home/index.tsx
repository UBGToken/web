import { AppService } from '../../services'
import { ViewDesktop } from './ViewDesktop'

export const HomePage = AppService.renderPage({
  desktop: ViewDesktop
})