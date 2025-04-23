import React, { useState } from 'react'
import { Calls } from '@services/browser/index.js'

const TestPage = () => {
  const [resulets, setResults] = useState([])
  const [imgSrc, setImgSrc] = useState('')
  const [xpathValue, setXpathValue] = useState(1)
  const createTab = async ({ url = 'https://google.com' }) => {
    const res = await Calls.createTab({ url })
    setResults(res)
  }
  const getCurrentTab = async () => {
    const res = await Calls.getCurrentTab()
    setResults(res)
  }
  const getAllTabs = async () => {
    const res = await Calls.getAllTabs()
    setResults(res)
  }
  const closeTabs = async () => {
    const res = await Calls.closeTabs({ tabIds: Number(xpathValue) })
    setResults(res)
  }
  const reloadTab = async () => {
    const res = await Calls.reloadTab({ tabId: Number(xpathValue) })
    setResults(res)
  }
  const typeText = async () => {
    const res = await Calls.typeText({
      tagIndex: xpathValue,
      text: 'hello world',
    })
    setResults(res)
  }
  const clickElement = async () => {
    const res = await Calls.clickElement({
      tagIndex: xpathValue,
    })
    setResults(res)
  }
  const hoverElement = async () => {
    const res = await Calls.hoverElement({
      tagIndex: xpathValue,
    })
    setResults(res)
  }

  const getScreenStructure = async () => {
    const res = await Calls.getScreenStructure({ screenIndex: xpathValue })
    console.log(res)
    setResults(res)
  }

  const getScreenContent = async () => {
    const res = await Calls.getScreenContent({ screenIndex: xpathValue })
    console.log(res)
    setResults(res)
  }

  const scrollScreen = async () => {
    const res = await Calls.scrollScreen({ screenIndex: xpathValue })
    setResults(res)
  }

  const getScreenShot = async () => {
    const res = await Calls.getScreenShot({})
    setImgSrc(res.screenshotUrl)
  }

  const generatePDF = async () => {
    const res = await Calls.generataPDF({ prompt: xpathValue })
    setResults(res)
  }

  const wait = async () => {
    const res = await Calls.delay({ seconds: 5 })
    setResults(res)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '0 5px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={createTab}>createTab</button>
        <button onClick={getCurrentTab}>getCurrentTab</button>
        <button onClick={getAllTabs}>getAllTabs</button>
        <button onClick={closeTabs}>closeTabs</button>
        <button onClick={reloadTab}>reloadTab</button>
      </div>
      <div style={{ padding: '6px 0' }}>
        <input type='text' value={xpathValue} onChange={(e) => setXpathValue(e.target.value)} />
      </div>
      <div style={{ padding: '6px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={getScreenStructure}>getScreenStructure</button>
        <button onClick={getScreenContent}>getScreenContent</button>
      </div>
      <div
        style={{
          padding: '6px 0',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          borderTop: '2px solid #eee',
        }}
      >
        <button onClick={typeText}>typeText</button>
        <button onClick={clickElement}>clickElement</button>
        <button onClick={hoverElement}>hoverElement</button>
      </div>
      <div
        style={{
          padding: '6px 0',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          borderTop: '2px solid #eee',
        }}
      >
        <button onClick={scrollScreen}>scrollScreen</button>
        <button onClick={getScreenShot}>getScreenShot</button>
        {/* <button onClick={generatePDF}>generatePDF</button> */}
      </div>
      <div>{JSON.stringify(resulets)}</div>
      {imgSrc && <img src={imgSrc} style={{ width: '100%' }} alt='预览图片' />}
    </div>
  )
}

export default TestPage
