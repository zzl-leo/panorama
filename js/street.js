/*
 * @Date: 2022-07-25 18:28:10
 * @LastEditors: Leo
 * @LastEditTime: 2022-07-25 18:32:47
 * @FilePath: \tes\js\street.js
 */
/* eslint-disable no-use-before-define */
$(() => {
  // 禁用微信的下拉
  $('body').on('touchmove', (event) => {
    event.preventDefault()
  })

  const BG_WIDTH = 3000
  const BG_HEIGHT = 3000
  const BG_NUMBER = 4
  const PER_ANGLE = 360 / BG_NUMBER

  const translateZ = (function calTranslateZ(opts) {
    return Math.round(opts.width / (2 * Math.tan(Math.PI / opts.number)))
  }({
    width: BG_WIDTH,
    number: BG_NUMBER
  }))

  const view = $('#bigCube')
  const viewW = view.width()
  const viewH = view.height()

  for (let i = 0; i < BG_NUMBER; i += 1) {
    $('<div></div>').css({
      background: `url(https://css3dpanorama-1251477229.cos.ap-guangzhou.myqcloud.com/img/panorama/cube_${i}.jpg) 0 0/cover no-repeat`,
      position: 'absolute',
      width: BG_WIDTH,
      height: BG_HEIGHT,
      transform: `rotateY(${180 - i * PER_ANGLE}deg) translateZ(${-translateZ + 2}px)`, // translateZ + 2 是为了去掉模模块间的缝隙
      'backface-visibility': 'hidden'
    }).appendTo('#cube')
  }

  for (let j = 0; j < 2; j += 1) {
    $('<div></div>').css({
      background: `url(https://css3dpanorama-1251477229.cos.ap-guangzhou.myqcloud.com/img/panorama/cube_${j + 4}.jpg) 0 0/cover no-repeat`,
      position: 'absolute',
      width: BG_WIDTH,
      height: BG_HEIGHT,
      left: (viewW - BG_WIDTH) / 2,
      top: (viewH - BG_HEIGHT) / 2,
      transform: `rotateX(${(j ? 1 : -1) * 90}deg) rotateZ(${j ? 180 : 0}deg) translateZ(${-translateZ + 2}px)` // translateZ + 2 是为了去掉模模块间的缝隙
    }).appendTo('#cube')
  }

  let lastMouseX = 0
  let lastMouseY = 0
  let curMouseX = 0
  let curMouseY = 0
  let lastAngleX = 0
  let lastAngleY = 0
  let frameTimer
  let timeoutTimer

  const requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (callback) {
      setTimeout(callback, 1000 / 60)
    }

  $(document).on('mousedown', mouseDownHandler)
  $(document).on('mouseup', mouseUpHandler)

  function mouseDownHandler(evt) {
    // 由于移动设备支持多指触摸，因此与PC的鼠标不同，返回是一数组touches。
    lastMouseX = evt.pageX || evt.touches[0].pageX
    lastMouseY = evt.pageY || evt.touches[0].pageY
    lastAngleX = aimAngleX
    lastAngleY = aimAngleY
    curMouseX = evt.pageX || evt.touches[0].pageX
    curMouseY = evt.pageY || evt.touches[0].pageY

    clearTimeout(timeoutTimer)

    $(document).on('mousemove', mouseMoveHandler)
    window.cancelAnimationFrame(frameTimer)
    frameTimer = requestAnimationFrame(go)
  }

  function mouseMoveHandler(evt) {
    curMouseX = evt.pageX || evt.touches[0].pageX
    curMouseY = evt.pageY || evt.touches[0].pageY

    dragRotate({
      pageX: curMouseX,
      pageY: curMouseY
    })
  }

  function mouseUpHandler() {
    // touchend 不具有坐标信息，因此需以touchmove的最后一次点提供
    // http://stackoverflow.com/questions/17957593/how-to-capture-touchend-coordinates
    // curMouseX = evt.pageX || evt.touches[0].pageX;
    // curMouseY = evt.pageY || evt.touches[0].pageY;

    $(document).unbind('mousemove')

    timeoutTimer = setTimeout(() => {
      window.cancelAnimationFrame(frameTimer)
    }, 2500)
  }

  let aimAngleX = 0
  let aimAngleY = 0
  let curBgAngleX = 0
  let curBgAngleY = 0

  function dragRotate() {
    // 注意：rotateX(Y) 与 鼠标（触摸）的X（Y）轴是交叉对应的

    // aimAngleX(Y)的值是通过【拖拽位移换算为相应角度得到】
    aimAngleX = ((180 / Math.PI) * (Math.atan((curMouseX - lastMouseX) / translateZ)) + lastAngleX)

    // 限制上下旋转监督在30°以内
    // eslint-disable-next-line max-len
    aimAngleY = Math.max(-60, Math.min(((180 / Math.PI) * Math.atan((curMouseY - lastMouseY) / (Math.sqrt((BG_HEIGHT / 2) ** 2 + translateZ ** 2) * 1.5)) + lastAngleY), 60))
  }

  // loop
  function go() {
    // bg 与 item 的位移增量速度的不一致，可形成视差运动
    curBgAngleX += (aimAngleX - curBgAngleX) * 0.5
    curBgAngleY += (aimAngleY - curBgAngleY) * 0.5

    $('#cube').css({
      transform: `rotateX(${curBgAngleY}deg) rotateY(${-curBgAngleX}deg) rotateZ(0)`
    })

    frameTimer = requestAnimationFrame(go)
  }
})