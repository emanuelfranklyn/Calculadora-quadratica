const graphContainer = document.getElementById('canvasContainer');
const graph = document.getElementById('equationGraph');
const themeSwitch = document.getElementById('themeSwitch');
const aValueElem = document.getElementById('numA');
const bValueElem = document.getElementById('numB');
const cValueElem = document.getElementById('numC');
const ctx = graph.getContext('2d');
const maxScale = 100;
const minScale = 10;

const graphColorsWhite = {
  background: '#ffffff',
  grid: '#000000',
  xAxis: '#ff5555',
  yAxis: '#5555ff',
  line: '#7755ff',
  text: '#000000',
  middleLine: '#770077',
  distance: '#005500',
};

const graphColorsDark = {
  background: '#000000',
  grid: '#ffffff',
  xAxis: '#ff5555',
  yAxis: '#5555ff',
  line: '#7755ff',
  text: '#ffffff',
  middleLine: '#ff33ff',
  distance: '#33ff33',
};

class GraphHandler {
  constructor() {
    this.scale = 50;
    this.lineThicness = 0.5;
    this.zoomFactor = 4;
    this.xPos = 0;
    this.yPos = 0;
    this.isDragging = false;
    this.initialClickPosX = 0;
    this.initialClickPosY = 0;
    this.graphColors = graphColorsWhite;
    this.aValue = 1;
    this.bValue = 0;
    this.cValue = 0;
    
    // startup logic
    document.body.style.setProperty('--transition-multiplier', 0);
    if (localStorage.getItem('darkmode') === 'true') {
      themeSwitch.checked = true;
      document.body.classList.add('dark');
      this.graphColors = graphColorsDark;
    }
    this.resize();
    // events
    aValueElem.addEventListener('input', () => {
      this.aValue = Number(aValueElem.value === '' ? 1 : aValueElem.value);
      this.render();
    });
    bValueElem.addEventListener('input', () => {
      this.bValue = Number(bValueElem.value);
      this.render();
    });
    cValueElem.addEventListener('input', () => {
      this.cValue = Number(cValueElem.value);
      this.render();
    });
    graph.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.initialClickPosX = e.clientX + this.xPos;
      this.initialClickPosY = e.clientY + this.yPos;
    });
    graph.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.xPos = -(e.clientX - this.initialClickPosX);
      this.yPos = -(e.clientY - this.initialClickPosY);
      this.render();
    });
    graph.addEventListener('wheel', (e) => {
      this.scale += e.deltaY < 0 ? this.zoomFactor : -this.zoomFactor;
      this.scale = Math.min(Math.max(minScale, this.scale), maxScale);
      this.render();
    });
    themeSwitch.addEventListener('change', () => {
      this.graphColors = themeSwitch.checked ? graphColorsDark : graphColorsWhite;
      document.body.classList.toggle('dark');
      localStorage.setItem('darkmode', themeSwitch.checked);
      this.render();
    });
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    window.addEventListener('resize', () => this.resize());
    // post startup logic
    document.body.style.setProperty('--transition-multiplier', 1);
  }

  resize() {
    const containerSize = graphContainer.getBoundingClientRect();
    const smallerSide = Math.min(containerSize.width, containerSize.height);
    graph.width = smallerSide;
    graph.height = smallerSide;
    this.render();
  }

  renderBackground() {
    // Clear the background
    ctx.fillStyle = this.graphColors.background;
    ctx.fillRect(0, 0, graph.width, graph.height);

    // Save the context state
    ctx.save();

    // Set the grid line properties
    ctx.beginPath();
    ctx.lineWidth = this.lineThicness;
    ctx.strokeStyle = this.graphColors.grid;

    // Calculate the center of the canvas
    const centerX = graph.width / 2;
    const centerY = graph.height / 2;

    // Draw vertical lines
    for (let lx = centerX - this.xPos; lx <= graph.width; lx += Number(this.scale)) {
      if (lx === centerX - this.xPos) continue;
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, graph.height);
    }
    for (let lx = centerX - this.xPos; lx >= 0; lx -= Number(this.scale)) {
      if (lx === centerX - this.xPos) continue;
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, graph.height);
    }

    // Draw horizontal lines
    for (let ly = centerY - this.yPos; ly <= graph.height; ly += Number(this.scale)) {
      if (ly === centerY - this.yPos) continue;
      ctx.moveTo(0, ly);
      ctx.lineTo(graph.width, ly);
    }
    for (let ly = centerY - this.yPos; ly >= 0; ly -= Number(this.scale)) {
      if (ly === centerY - this.yPos) continue;
      ctx.moveTo(0, ly);
      ctx.lineTo(graph.width, ly);
    }

    ctx.stroke();
    ctx.closePath();

    ctx.lineWidth = this.lineThicness * 1.5;
    ctx.strokeStyle = this.graphColors.xAxis;
    ctx.beginPath();
    ctx.moveTo(0, centerY - this.yPos);
    ctx.lineTo(graph.width, centerY - this.yPos);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = this.graphColors.yAxis;
    ctx.beginPath();
    ctx.moveTo(centerY - this.xPos, 0);
    ctx.lineTo(centerY - this.xPos, graph.height);
    ctx.closePath();
    ctx.stroke();

    // text
    ctx.fillStyle = this.graphColors.text;
    ctx.font = `${this.scale/3}px Arial`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    const metricsY = ctx.measureText('0');
    // draw the x axis numbers
    for (let lx = centerX - this.xPos; lx <= graph.width; lx += Number(this.scale)) {
      ctx.fillText((lx - centerX + this.xPos) / this.scale, lx, centerY - this.yPos + metricsY.hangingBaseline * 1.5);
    }
    for (let lx = centerX - this.xPos; lx >= 0; lx -= Number(this.scale)) {
      ctx.fillText((lx - centerX + this.xPos) / this.scale, lx, centerY - this.yPos + metricsY.hangingBaseline * 1.5);
    }
    ctx.textAlign = 'right';
    // draw the y axis numbers
    for (let ly = centerY - this.yPos; ly <= graph.height; ly += Number(this.scale)) {
      ctx.fillText(-((ly - centerY + this.yPos) / this.scale), centerX - this.xPos, ly + metricsY.hangingBaseline / 2);
    }
    for (let ly = centerY - this.yPos; ly >= 0; ly -= Number(this.scale)) {
      ctx.fillText(-((ly - centerY + this.yPos) / this.scale), centerX - this.xPos, ly + metricsY.hangingBaseline / 2);
    }

    ctx.restore();
  }

  getFormulaValue(x) {
    return ((this.aValue * Math.pow(x, 2)) + (this.bValue * x) + this.cValue);
  }

  render() {
    const centerX = graph.width / 2;
    const centerY = graph.height / 2;
    this.renderBackground();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = -centerX; x < graph.width / 2; x+=0.1) {
      const y = this.getFormulaValue(x);
      const treatedY = y * this.scale;
      ctx.lineTo((x * this.scale) + centerX - this.xPos, centerY - treatedY - this.yPos);
    }
    ctx.closePath();

    ctx.lineWidth = this.lineThicness * 2;
    ctx.strokeStyle = this.graphColors.line;
    ctx.stroke();

    ctx.beginPath();

    const b1 = this.bValue / this.aValue;
    const media = -b1 / 2;
    const distance = Math.sqrt(Math.pow(media, 2) - (this.cValue / this.aValue));

    const mediaInGraph = (media * this.scale) + centerX - this.xPos;
    const lowestPointY = this.getFormulaValue(media) * this.scale;
    const distanceInScale = distance * this.scale;
    const distanceInGraph = mediaInGraph + distanceInScale;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    ctx.strokeStyle = this.graphColors.text;
    ctx.fillStyle = this.graphColors.text;
    ctx.font = `${0.05 * graph.width}px Arial`;
    const topDataMetrics = ctx.measureText('X');
    const distanceText = !isNaN(distance) ? distance.toFixed(2).replace('.', ',') : 'Não há raiz';
    const rRoot = !isNaN(distance) ? (media - distance).toFixed(2).replace('.', ',') : 'Não há raiz';
    const sRoot = !isNaN(distance) ? (media + distance).toFixed(2).replace('.', ',') : 'Não há raiz';
    ctx.fillText('m = ' + media.toFixed(2).replace('.', ','), 0.01 * graph.width, 0.01 * graph.height);
    ctx.fillText('d = ' + distanceText, 0.01 * graph.width, 0.01 * graph.height + (topDataMetrics.fontBoundingBoxAscent + topDataMetrics.fontBoundingBoxDescent)*1);
    ctx.fillText('r = ' + rRoot, 0.01 * graph.width, 0.01 * graph.height + (topDataMetrics.fontBoundingBoxAscent + topDataMetrics.fontBoundingBoxDescent)*2);
    ctx.fillText('s = ' + sRoot, 0.01 * graph.width, 0.01 * graph.height + (topDataMetrics.fontBoundingBoxAscent + topDataMetrics.fontBoundingBoxDescent)*3);
    
    ctx.strokeStyle = this.graphColors.middleLine;
    ctx.fillStyle = this.graphColors.middleLine;
    ctx.font = `${this.scale/3}px Arial`;
    const metrics = ctx.measureText('m');
    if (!isNaN(distance)) {
      ctx.moveTo(mediaInGraph, centerY - this.yPos - lowestPointY);
      ctx.lineTo(mediaInGraph, centerY - this.yPos);
  
      if (lowestPointY < -(this.scale / 2)) {
        ctx.fillText('m', mediaInGraph - metrics.width - (0.1 * this.scale), centerY - this.yPos - (lowestPointY / 2));
      }
      
      ctx.closePath();
      ctx.stroke();
      
      ctx.strokeStyle = this.graphColors.distance;
      ctx.fillStyle = this.graphColors.distance;
      ctx.lineWidth = this.lineThicness * 4;
      ctx.beginPath()
  
      ctx.moveTo(mediaInGraph - distanceInScale, centerY - this.yPos);
      ctx.lineTo(distanceInGraph, centerY - this.yPos);
  
      // indicators
      ctx.moveTo(mediaInGraph - distanceInScale, centerY - this.yPos - (0.15 * this.scale));
      ctx.lineTo(mediaInGraph - distanceInScale, centerY - this.yPos + (0.15 * this.scale));
      ctx.moveTo(mediaInGraph + distanceInScale, centerY - this.yPos - (0.15 * this.scale));
      ctx.lineTo(mediaInGraph + distanceInScale, centerY - this.yPos + (0.15 * this.scale));
      ctx.moveTo(mediaInGraph, centerY - this.yPos - (0.15 * this.scale));
      ctx.lineTo(mediaInGraph, centerY - this.yPos + (0.15 * this.scale));
      
      ctx.textAlign = 'center';
      if (distance >= 0.5) {
        ctx.fillText('d', mediaInGraph - (distanceInScale / 2), centerY - this.yPos - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent));
        ctx.fillText('d', mediaInGraph + (distanceInScale / 2), centerY - this.yPos - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent));
        ctx.fillText('r', mediaInGraph - distanceInScale, centerY - this.yPos - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent));
        ctx.fillText('s', mediaInGraph + distanceInScale, centerY - this.yPos - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent));
      }
      
      ctx.closePath();
      ctx.stroke();
    }

  }
}

const calculations = {
  a: 1,
  b: 0,
  c: 0,
  b1: '0',
  Ib1: '0',
  c1: '0',
  sigb1: '',
  sigc1: '',
  m: '0',
  msq: '0',
  dsq: '0',
  d: '0',
  dSym: '',
  r: '0',
  s: '0',
  solutionString: '',
}

function calculate(a, b, c) {
  calculations['a'] = a;
  calculations['b'] = b;
  calculations['c'] = c;
  const b1 = b / a;
  const c1 = c / a;
  calculations['b1'] = b1.toFixed(2).replace('.', ',');
  calculations['Ib1'] = (-b1).toFixed(2).replace('.', ',');
  calculations['c1'] = c1.toFixed(2).replace('.', ',');
  calculations['sigb1'] = b1 >= 0 ? '+ ' : '';
  calculations['sigc1'] = c1 >= 0 ? '+ ' : '';
  const m = -(b / a) / 2;
  calculations['m'] = m.toFixed(2).replace('.', ',');
  calculations['msq'] = (Math.pow(m, 2)).toFixed(2).replace('.', ',');
  calculations['dsq'] = (Math.pow(m, 2) - c1).toFixed(2).replace('.', ',');
  const d = Math.sqrt(Math.pow(m, 2) - c1);
  calculations['d'] = !isNaN(d) ? d.toFixed(2).replace('.', ',') : 'Não há raiz real';
  calculations['dSym'] = !isNaN(d) ? d.toFixed(2).replace('.', ',') : '∅';
  const r = m - d;
  const s = m + d;
  calculations['r'] = !isNaN(r) ? r.toFixed(2).replace('.', ',') : '∅';
  calculations['s'] = !isNaN(s) ? s.toFixed(2).replace('.', ',') : '∅';
  if (!isNaN(r)) {
    if (r === s) calculations['solutionString'] = `\u007B x \u2208 \u211D | ${r.toFixed(2).replace('.', ',')} \u007D`;
    else calculations['solutionString'] = `\u007B x \u2208 \u211D | ${r.toFixed(2).replace('.', ',')}; ${s.toFixed(2).replace('.', ',')} \u007D`;
  } else calculations['solutionString'] = '∅';
}

function replaceTexts() {
  const texts = document.querySelectorAll('reTe, tspan[value]');
  texts.forEach((text) => {
    const key = text.getAttribute('value');
    text.innerText = calculations[key];
    text.textContent = calculations[key];
  });
}

function inputChange() {
  calculate(Number(aValueElem.value === '' ? 1 : aValueElem.value), Number(bValueElem.value), Number(cValueElem.value));
  replaceTexts();
}

aValueElem.addEventListener('input', inputChange);
bValueElem.addEventListener('input', inputChange);
cValueElem.addEventListener('input', inputChange);

const ghandler = new GraphHandler();
ghandler.render();