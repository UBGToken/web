import { FC } from 'react'
import { Element } from 'react-scroll'
import { Button, Icon, InputNumber } from '../../../components'
import { InputTagSelect } from '../../../components/input/tag-select'
import { InputWraper, useForm } from '../../../modules'

export const SectionBank: FC = () => {
  return (
    <Element name="SectionBank" className="Section SectionBank">
      <div className="container">
        <div className="sectionTitle">Bank</div>
        <div className="sectionExcerpt">Dolore lobortis animi exercitation ipsa etiam</div>

        <div className="numberReports mb25">
          <div className="row">
            <div className="col-sm-3">
              <div className="item">
                <div className="label">Circulating Supply</div>
                <div className="value">8,399,778.73</div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="item">
                <div className="label">Circulating Supply</div>
                <div className="value">8,399,778.73</div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="item">
                <div className="label">Circulating Supply</div>
                <div className="value">8,399,778.73</div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="item">
                <div className="label">Circulating Supply</div>
                <div className="value">8,399,778.73</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-sm-5">
            <Form />
          </div>
        </div>
      </div>
    </Element>
  )
}

const Form: FC = () => {
  const durationOptions = [
    { label: '11 days', value: '11 days' },
    { label: '1 month', value: '1 month' },
    { label: '3 months', value: '3 months' },
    { label: '6 months', value: '6 months' },
    { label: '12 months', value: '12 months' },
  ]

  const { handleSubmit, isSubmitting, inputProps } = useForm({
    fields: {
      amount: {
        isRequired: true,
        label: 'Enter your amount to save',
      },
      duration: {
        isRequired: true,
        label: 'Saving duration',
        exProps: {
          options: durationOptions
        },
        defaultValue: durationOptions[0].value
      }
    },
    onSubmit: async () => {

    }
  })

  return <form onSubmit={handleSubmit}>
    <div className="head">
      <div className="title">Save Your Money</div>
      <div className="UserBalance">
        <span className="icon"><Icon.Wallet /></span>
        <span className="label">Your balance:</span>
        <span className="value">$245.7</span>
      </div>
    </div>

    <InputWraper inputProps={inputProps.amount} component={InputNumber} />
    <InputWraper inputProps={inputProps.duration} component={InputTagSelect} className="hideBorder" />

    <div className="cta">
      <p className="note">After <strong className="textPrimary">30 days</strong> with <strong className="textPrimary">27 ROI</strong>, you will able to claim <strong className="textPrimary">2 UBG</strong></p>
      <Button isLoading={isSubmitting} type="submit" label="Approve" />
    </div>
  </form>
}