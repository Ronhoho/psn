import React from "react"
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from './material/Dialog'
import Card from '../components/material/Card'
import Button from '../components/material/Button'
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,

  CardContent,
  CardMedia,
} from '@material-ui/core'
import message from '../i18n'
import CircularProgress from '@material-ui/core/CircularProgress';
import Warning from '../icons/Warning'
import Cross from '../icons/Cross'
import { v4 as uuid } from 'uuid'
import moment from 'moment'

import { getmedialist, getPgLstByUdid } from '../utils/apis'
import convert from 'xml2js'
const useStyles = makeStyles({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 20,
  },
  action: {
    marginTop: 0,
    marginRight: 0
  },
  title: {
    fontSize: '1.2rem'
  },
  media: {
    height: '12vh',
    margin: '0 20px',
    backgroundPosition: 'center top',
    backgroundSize: 'contain'

  },
  container: {
    display: 'flex',
    paddingTop: '1.5rem',
    flexWrap: 'wrap'
  },
  card: {
    marginRight: '1.5%',
    marginBottom: 20,
    height: 'auto',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0 3px 8px 0 rgba(141, 152, 170, .7)',
    },
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: '0 24px',
    // '& > *:nth-child(2)': {
    //   width: 250
    // }
  },
  spacer: {
    flex: 1
  }
})
const MediaContent = props => {
  const { medias, activated, setActivated, mutiple } = props
  // console.log(medias)
  const classes = useStyles()
  const baseURL = process.env.REACT_APP_DOMAIN || 'http://127.0.0.1'
  const mf = baseURL + '/mf'
  const psn = baseURL + '/psn'
  const getMediaPath = media => {
    if (media.mtype === 'image') return `${mf}/_preview/${media.mname.split('.')[0]}.jpg`
    if (media.mtype === 'video') return `${mf}/_preview/${media.mname.split('.')[0]}.jpg`
    if (media.mtype === 'board') return `${psn}/images/preview/${media.mtype}.png`
    if (media.mtype === 'stxt') return `${psn}/images/preview/ticker.png`
    return `${psn}/images/preview/ext-${media.mtype}.png`
  }
  const handleClickMedia = media => {
    if (mutiple) {
      if (activated.find(act => act.mid === media.mid) === undefined) {
        setActivated([...activated, { ...media }])
      } else {
        setActivated([...activated.filter(act => act.mid !== media.mid)])
      }
    } else {
      if (activated.find(act => act.mid === media.mid) === undefined) {
        setActivated([{ ...media }])
      } else {
        setActivated([])
      }
    }
  }
  return (
    <>
      {
        medias.map(media =>
          <Card
            key={media.uuid}
            className={classes.card}
            style={{
              width: '25%',
              backgroundColor: activated.find(act => act.mid === media.mid) !== undefined ? '#bebebe' : '#fff'
            }}
            onClick={() => handleClickMedia(media)}>
            <div style={{
              padding: '0 10px 0 20px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.2rem'
            }}>
              {media.mtitle}
              <div style={{ flex: 1 }} />
            </div>
            <CardMedia
              className={classes.media}
              image={getMediaPath(media)}
            />
            <CardContent style={{ padding: '.8rem 8px', display: 'flex' }}>
              <div className={classes.spacer}></div>
              {moment(media.utime).format('YYYY/MM/DD HH:mm')}
            </CardContent>
          </Card>
        )
      }
    </>
  )
}
const ProgramContent = props => {
  const { programs, activated, setActivated, mutiple } = props
  const classes = useStyles()
  const baseURL = process.env.REACT_APP_DOMAIN || 'http://127.0.0.1'
  const mf = baseURL + '/mf'
  const psn = baseURL + '/psn'
  const handleClickProgram = program => {
    if (mutiple) {
      if (activated.find(act => act.pgid === program.pgid) === undefined) {
        setActivated([...activated, { ...program }])
      } else {
        setActivated([...activated.filter(act => act.pgid !== program.pgid)])
      }
    } else {
      if (activated.find(act => act.pgid === program.pgid) === undefined) {
        setActivated([{ ...program }])
      } else {
        setActivated([])
      }
    }
  }
  return (
    <>
      {
        programs.map(program =>
          <Card
            key={program.uuid}
            className={classes.card}
            style={{
              width: '25%',
              backgroundColor: activated.find(act => act.pgid === program.pgid) !== undefined ? '#bebebe' : '#fff'
            }}
            onClick={() => handleClickProgram(program)}>
            <div style={{
              padding: '0 10px 0 20px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.2rem'
            }}>
              {program.pgname}
              <div style={{ flex: 1 }} />
            </div>
            <CardMedia
              className={classes.media}
              image={`${mf}${program.preview.split('mf')[1]}?t=${moment().unix()}`}
            />
            <CardContent style={{ padding: '.8rem 8px', display: 'flex' }}>
              <div className={classes.spacer}></div>
              {moment(program.utime).format('YYYY/MM/DD HH:mm')}
            </CardContent>
          </Card>
        )
      }
    </>
  )
}
export default props => {
  const {
    type,
    titleText,
    isDialogOpen,
    setDialogOpen,
    confirm,
    cancel,
    close,
    confirmText,
    cancelText,
    mutiple
  } = props
  const [targets, setTargets] = React.useState([])
  const [activated, setActivated] = React.useState([])
  const { sel_udid } = useSelector(state => state.user)
  React.useEffect(() => {
    if (isDialogOpen) {
      if (type === 'program') {
        getPgLstByUdid({ select_udid: sel_udid }).then(response => {
          convert.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (!err) {
              if (result.root.pg_info === undefined) return setTargets([])
              if (Object.keys(result.root.pg_info)[0] === '0') {
                setTargets([...result.root.pg_info.map(program => ({ ...program, uuid: uuid() }))])
              } else {
                setTargets([{ ...result.root.pg_info, uuid: uuid() }])
              }
            }
          })
        })
      } else {
        getmedialist({ udid: 1, foid: 0, mtype: type })
          .then((response) => {
            convert.parseString(response.data, { explicitArray: false }, (err, result) => {
              if (!err) {
                if (result.root.media_info === undefined) return setTargets([])
                if (Object.keys(result.root.media_info)[0] === '0') {
                  setTargets([...result.root.media_info.map(media => ({ ...media, uuid: uuid() }))])
                } else {
                  setTargets([{ ...result.root.media_info, uuid: uuid() }])
                }
              }
            })
          })
      }
    }
  }, [isDialogOpen])

  const handleCancel = () => {
    if (typeof cancel === 'function') cancel()
    setDialogOpen(false)
  }
  const handleClose = () => {
    if (typeof close === 'function') close()
    setDialogOpen(false)
  }
  const handleConfirm = () => {
    if (typeof confirm === 'function') confirm(activated)
    setDialogOpen(false)
  }
  return (
    <Dialog
      open={isDialogOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {titleText}
      </DialogTitle>
      <Cross style={{ position: 'absolute', right: '1.4rem', top: '1.4rem', cursor: 'pointer' }} onClick={handleClose} />
      <Divider />
      <DialogContent style={{ display: 'flex', alignItems: 'flex-start', height: 700 }}>
        {
          type === 'program'
            ? <ProgramContent programs={targets} activated={activated} setActivated={setActivated} mutiple={mutiple} />
            : <MediaContent medias={targets} activated={activated} setActivated={setActivated} mutiple={mutiple} />
        }
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          variant="contained"
          style={{ width: 100 }}>
          {cancelText ? cancelText : '取消'}
        </Button>
        <Button
          onClick={handleConfirm}
          color='primary'
          variant="contained"
          style={{ width: 100, marginLeft: '1.4rem' }}>
          {confirmText ? confirmText : '確認'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}